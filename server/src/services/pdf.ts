import fs from "fs";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string; numpages: number }>;
import { PdfDocument } from "../models/PdfDocument";
import { PdfChunk, type IPdfChunk } from "../models/PdfChunk";
import { Question } from "../models/Question";
import { generateQuestion as aiGenerate, questionPassesStrictCheck } from "./ai";
import mongoose from "mongoose";

const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;
const QUESTIONS_PER_CHUNK = 3;
const CONCURRENCY = 3; // parallel AI calls per batch

const CHUNK_SIZE = 600;
const CHUNK_MIN  = 80;

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n").replace(/\r/g, "\n")
    .replace(/[^\S\n]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function chunkText(text: string): string[] {
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  let wordCount = 0;

  for (const para of paragraphs) {
    const words = para.split(/\s+/).length;
    if (wordCount + words > CHUNK_SIZE && wordCount > 0) {
      if (wordCount >= CHUNK_MIN) chunks.push(current.trim());
      current = para; wordCount = words;
    } else {
      current += (current ? "\n\n" : "") + para;
      wordCount += words;
    }
  }
  if (current.trim() && wordCount >= CHUNK_MIN) chunks.push(current.trim());
  return chunks;
}

export async function extractAndStoreChunks(params: {
  filePath: string;
  originalName: string;
  subject: string;
  track: string;
  uploadedBy: string | null;
}): Promise<{ documentId: string; chunkCount: number; pageCount: number }> {
  const { filePath, originalName, subject, track, uploadedBy } = params;
  const buffer = fs.readFileSync(filePath);
  const stat = fs.statSync(filePath);

  let parsed: { text: string; numpages: number };
  try {
    parsed = await pdfParse(buffer);
  } finally {
    fs.unlink(filePath, () => {});
  }

  const chunks = chunkText(cleanText(parsed.text));
  const pageCount = parsed.numpages;

  const doc = await PdfDocument.create({
    original_name: originalName,
    subject, track,
    page_count: pageCount,
    chunk_count: chunks.length,
    file_size_bytes: stat.size,
    uploaded_by: uploadedBy ?? null,
  });

  const chunkDocs = chunks.map((content, i) => ({
    document_id: doc._id,
    subject, track,
    chunk_index: i,
    content,
    word_count: content.split(/\s+/).length,
  }));
  await PdfChunk.insertMany(chunkDocs);

  return { documentId: String(doc._id), chunkCount: chunks.length, pageCount };
}

export async function getRandomChunk(params: {
  subject: string;
  track: string;
}): Promise<IPdfChunk | null> {
  const { subject, track } = params;
  const chunk = await PdfChunk.findOneAndUpdate(
    { subject, track },
    { $inc: { used_count: 1 } },
    { sort: { used_count: 1 }, new: false }
  );
  return chunk;
}

export async function listDocuments(subject?: string) {
  const filter = subject ? { subject } : {};
  const docs = await PdfDocument.find(filter).sort({ created_at: -1 }).lean();
  return docs.map((d) => ({ ...d, id: String(d._id) }));
}

export async function deleteDocument(id: string): Promise<boolean> {
  const doc = await PdfDocument.findByIdAndDelete(id);
  if (!doc) return false;
  await PdfChunk.deleteMany({ document_id: doc._id });
  // Delete all questions sourced from this PDF
  await Question.deleteMany({ source_document_id: doc._id });
  return true;
}

// ─── Populate question bank from an uploaded PDF ─────────────────────────────
// Runs in the background after PDF upload. Reads every chunk, generates
// QUESTIONS_PER_CHUNK questions per chunk, stores them in the Question collection.
export async function populateQuestionBankFromPdf(params: {
  documentId: string;
  subject: string;
  track: string;
}): Promise<{ generated: number; failed: number }> {
  const { documentId, subject, track } = params;
  const docObjectId = new mongoose.Types.ObjectId(documentId);

  const chunks = await PdfChunk.find({ document_id: docObjectId }).lean();
  let generated = 0;
  let failed = 0;

  // Process chunks in parallel batches
  for (let i = 0; i < chunks.length; i += CONCURRENCY) {
    const batch = chunks.slice(i, i + CONCURRENCY);

    await Promise.all(batch.map(async (chunk) => {
      for (let q = 0; q < QUESTIONS_PER_CHUNK; q++) {
        const difficulty = DIFFICULTIES[(generated + q) % DIFFICULTIES.length];
        try {
          const aiQ = await aiGenerate({
            subject, track,
            difficulty,
            pdfContext: chunk.content,
          });

          // Build combined text so the positive keyword check has maximum surface area
          const fullText = [
            aiQ.question,
            aiQ.options.A, aiQ.options.B, aiQ.options.C, aiQ.options.D,
            aiQ.explanation ?? "",
            aiQ.topic ?? "",
          ].join(" ");

          if (!questionPassesStrictCheck(fullText, subject)) {
            console.warn(`[Bank] Rejected off-subject question for ${subject} (chunk ${chunk.chunk_index}, q${q})`);
            failed++;
            continue; // skip only this question — keep generating remaining ones for this chunk
          }

          const exists = await Question.exists({ subject, question: aiQ.question });
          if (exists) { failed++; continue; } // duplicate — skip, keep going

          await Question.create({
            subject, track, difficulty,
            question:           aiQ.question,
            options:            aiQ.options,
            correct_option:     aiQ.correct_option,
            explanation:        aiQ.explanation,
            topic:              aiQ.topic,
            source_document_id: docObjectId,
            used_count:         0,
          });
          generated++;
        } catch (err) {
          console.error(`[Bank] Failed on chunk ${chunk.chunk_index}:`, err);
          failed++;
        }
      }
    }));
  }

  console.log(`[Bank] ${subject}: +${generated} questions (${failed} failed) from doc ${documentId}`);
  return { generated, failed };
}

// ─── Bank stats per subject ───────────────────────────────────────────────────
export async function getQuestionBankStats(): Promise<
  { subject: string; total: number; by_difficulty: Record<string, number> }[]
> {
  const result = await Question.aggregate([
    { $group: { _id: { subject: "$subject", difficulty: "$difficulty" }, count: { $sum: 1 } } },
    { $group: {
        _id: "$_id.subject",
        total: { $sum: "$count" },
        difficulties: { $push: { k: "$_id.difficulty", v: "$count" } },
    }},
    { $sort: { _id: 1 } },
  ]);

  return result.map((r) => ({
    subject:       r._id as string,
    total:         r.total as number,
    by_difficulty: Object.fromEntries((r.difficulties as { k: string; v: number }[]).map((d) => [d.k, d.v])),
  }));
}

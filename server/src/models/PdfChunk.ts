/// <reference types="node" />
import mongoose, { Schema, type Document } from "mongoose";

export interface IPdfChunk extends Document {
  document_id: mongoose.Types.ObjectId;
  subject: string;
  track: string;
  chunk_index: number;
  content: string;
  word_count: number;
  used_count: number;
  created_at: Date;
}

const PdfChunkSchema = new Schema<IPdfChunk>(
  {
    document_id:  { type: Schema.Types.ObjectId, ref: "PdfDocument", required: true, index: true },
    subject:      { type: String, required: true, index: true },
    track:        { type: String, required: true },
    chunk_index:  { type: Number, required: true },
    content:      { type: String, required: true },
    word_count:   { type: Number, default: 0 },
    used_count:   { type: Number, default: 0 },
    created_at:   { type: Date, default: Date.now },
  },
  { timestamps: false }
);

PdfChunkSchema.index({ subject: 1, track: 1, used_count: 1 });

export const PdfChunk = mongoose.model<IPdfChunk>("PdfChunk", PdfChunkSchema);

import mongoose, { Schema, type Document } from "mongoose";

export interface IPdfDocument extends Document {
  original_name: string;
  subject: string;
  track: string;
  page_count: number;
  chunk_count: number;
  file_size_bytes: number;
  uploaded_by: mongoose.Types.ObjectId | null;
  created_at: Date;
}

const PdfDocumentSchema = new Schema<IPdfDocument>(
  {
    original_name:   { type: String, required: true },
    subject:         { type: String, required: true, index: true },
    track:           { type: String, required: true },
    page_count:      { type: Number, default: 0 },
    chunk_count:     { type: Number, default: 0 },
    file_size_bytes: { type: Number, default: 0 },
    uploaded_by:     { type: Schema.Types.ObjectId, ref: "User", default: null },
    created_at:      { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const PdfDocument = mongoose.model<IPdfDocument>("PdfDocument", PdfDocumentSchema);

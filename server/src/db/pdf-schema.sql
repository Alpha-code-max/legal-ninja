-- PDF Documents & Chunks (append to existing schema)

CREATE TABLE IF NOT EXISTS pdf_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename        TEXT NOT NULL,
  original_name   TEXT NOT NULL,
  subject         VARCHAR(50) NOT NULL,
  track           VARCHAR(30) NOT NULL,
  page_count      INTEGER,
  chunk_count     INTEGER NOT NULL DEFAULT 0,
  file_size_bytes INTEGER,
  uploaded_by     UUID REFERENCES users(uid),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pdf_chunks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id     UUID NOT NULL REFERENCES pdf_documents(id) ON DELETE CASCADE,
  subject         VARCHAR(50) NOT NULL,
  track           VARCHAR(30) NOT NULL,
  page_number     INTEGER,
  chunk_index     INTEGER NOT NULL,
  content         TEXT NOT NULL,
  word_count      INTEGER NOT NULL DEFAULT 0,
  used_count      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pdf_chunks_subject ON pdf_chunks(subject, track);
CREATE INDEX IF NOT EXISTS idx_pdf_chunks_used ON pdf_chunks(used_count);

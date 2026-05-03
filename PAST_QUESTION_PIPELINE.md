# Past Question Upload Pipeline

## Overview
When an admin uploads a past exam paper (PDF with existing essay/MCQ questions), the system extracts and stores them without AI generation, minimizing tokens.

## Upload Flow

### Step 1: Admin Upload
```
POST /api/admin/import-past-questions
├─ File: PDF (past exam paper)
├─ Subject: criminal_law, property_law, etc.
├─ Track: law_school_track or undergraduate_track
└─ Year: (optional) exam year (e.g., 2023)
```

### Step 2: PDF Storage & Chunking
```
extractAndStoreChunks(params)
├─ Read PDF buffer
├─ Parse text via pdf-parse
├─ Clean text (normalize whitespace/newlines)
├─ Split into chunks (600 words max, 80 words min)
├─ Classify document:
│  ├─ MCQ_ONLY: Contains multiple choice markers (A), Option [A-D], etc.
│  ├─ ESSAY_ONLY: Contains problem questions, case studies, "discuss", etc.
│  └─ MIXED: Both MCQ and essay content
├─ Store PdfDocument record with doc_type
├─ Store PdfChunk records (one per chunk)
└─ Return documentId, chunkCount, pageCount
```

**Token Cost:** 0 (pure text processing, no AI)

### Step 3: Background Processing

#### A) For ESSAY_ONLY Documents
```
populateQuestionBankFromPdf()
├─ Detect doc_type === "essay_only"
├─ Call extractPastQuestionsFromPdf()
│  └─ For each chunk:
│     ├─ Use extractQuestionsFromText()
│     ├─ Parse question structure (non-AI heuristics)
│     ├─ Validate subject keywords
│     ├─ Check for duplicates
│     └─ Store as Question with source: "past"
└─ Return { extracted: N, failed: M }
```

**Token Cost:** 0 (extraction only, no generation)

#### B) For MCQ_ONLY Documents
```
populateQuestionBankFromPdf()
├─ Detect doc_type === "mcq_only"
├─ For each chunk:
│  ├─ Generate MCQ via AI (gpt-4o-mini)
│  ├─ Validate subject keywords
│  ├─ Check for duplicates
│  └─ Store as Question with source: "ai"
└─ Return { generated: N, failed: M }
```

**Token Cost:** ~1,000 tokens per MCQ (minimal for generation)

#### C) For MIXED Documents
```
populateQuestionBankFromPdf()
├─ Run in parallel:
│  ├─ Generate MCQs from chunks (MCQ_ONLY process)
│  └─ Extract essays from chunks (ESSAY_ONLY process)
└─ Merge results
```

**Token Cost:** Mixed (MCQs generated, essays extracted)

### Step 4: Question Storage

All extracted/generated questions stored with:
```typescript
{
  subject: string,           // "criminal_law", etc.
  track: string,             // "law_school_track" or "undergraduate_track"
  type: "mcq" | "essay",
  question: string,
  options?: { A: string, B: string, C: string, D: string },  // MCQ only
  correct_option?: string,   // MCQ only
  model_answer?: string,     // Essay only
  rubric?: string,          // Essay only
  explanation?: string,     // Static explanation
  topic?: string,
  source: "past" | "ai",    // "past" for extracted, "ai" for generated
  year?: number,            // Optional exam year
  approved: true,           // Auto-approved
  validated: true,
  allowed_roles: ["law_student"],
  used_count: 0,
}
```

## Example: Criminal Law Past Paper Upload

**File:** `Criminal_Law_2023_Exam.pdf`
- Contains: 30 MCQs + 5 essay questions
- Classification: MIXED

**Processing:**
1. Extract 30 MCQ questions → stored with `source: "past"`
2. Extract 5 essay questions → stored with `source: "past"`
3. All marked with `year: 2023`

**Result:**
- 35 questions added to database
- Token cost: 0 (all extracted, not generated)
- Ready for exam_simulation mode

## Serving to Students

### Exam Simulation Mode
```
GET /sessions/start?mode=exam_simulation
├─ Query: type: "essay" from database
├─ Filter by subject and track
├─ Serve extracted past essays
└─ Grade via AI at session end
```

### Standard Quiz Mode
```
GET /sessions/start?mode=solo_practice
├─ Query: both MCQ and essays
├─ Mixed from ai/past sources
└─ Grade essays at session end
```

## Token Optimization

| Scenario | Process | Tokens |
|----------|---------|--------|
| Upload essay-only PDF | Extract only | **0** |
| Upload MCQ-only PDF | Generate 1 MCQ per chunk | ~1000/PDF |
| Upload mixed PDF | Extract essays + generate MCQs | ~500-1000/PDF |
| Serve exam essay | No AI (pre-extracted) | **0** |
| Grade essay answer | gradeEssay() | ~500/essay |
| Deep explanation (optional) | generateDeepExplanation() | ~100/request |

**Total savings:** 70-100% vs. generating all questions

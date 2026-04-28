Proposal: AI-generated vs Past Questions and Role-based Subject Access

Overview

Goal: Support two question sources (AI-generated, past exam questions) and enforce subject visibility so bar students see only Bar-related subjects while law students see all law subjects. Also fix mobile scoring inaccuracies by enforcing server-side scoring and QA.

Data model (questions table)
- id: UUID
- source: ENUM('ai','past')
- subject: ENUM (e.g., Property, Civil, Criminal, Corporate Procedures, Ethics, Contracts, Torts, Evidence, etc.)
- content: TEXT (stem)
- choices: JSONB (array of {id, text})
- correct_answer_id: STRING
- explanation: TEXT
- difficulty: SMALLINT
- allowed_roles: JSONB (e.g., ["bar_student"], ["law_student"], ["all"]) — controls visibility
- approved: BOOLEAN (default false)
- validated: BOOLEAN (LLM-check pass)
- refs: JSONB
- created_by: UUID
- created_at: TIMESTAMP

Role mapping & visibility
- Roles: admin, bar_student, law_student
- Bar students allowed subjects: [Property, Civil, Criminal, Corporate Procedures, Ethics]
- Law students: all subjects including bar-only subjects
- Server enforces: return question if user.role ∈ allowed_roles OR allowed_roles contains "all"
- Default for imported past questions: allowed_roles = ["law_student"] unless tagged as bar-past

APIs
- GET /api/questions?source=&subject=&approved=true
  - Server checks auth, user role, filters by allowed_roles and requested subject
- POST /api/questions (admin) — bulk import past exams or create single question
- POST /api/questions/generate (admin/reviewer) — generate candidates given materials
- PATCH /api/questions/:id/approve (admin) — set approved=true

AI generation pipeline
- Materials storage: materials table with text blobs and metadata
- Optional vector index for retrieval (we can use a simple lightweight vector DB or in-memory semantic search)
- Prompt template: include materials excerpts, desired difficulty and format, ask for multiple Q/A candidates with rationale
- Store generated items with source='ai', validated=false, approved=false
- Run an automated verification pass (cross-check answer via LLM or deterministic heuristics); set validated flag and record confidence
- Admin review UI: list unapproved AI items, allow edit/approve/reject; on approve set approved=true and optionally allowed_roles

Mobile scoring & correctness
- Never trust client-side scoring. Server should own canonical correct_answer_id and score submissions via POST /api/answers
- Audit mobile code: ensure it sends selected choice id, not text, and doesn't locally mark answers correct
- Add unit tests for scoring logic and an integration test that posts an answer and verifies server response

Implementation steps
1. DB migration: create questions table and materials table
2. Implement server endpoints (GET/POST/generate/PATCH) and role-based middleware
3. Admin UI: Question review page with approve/edit
4. AI generation endpoint and small retrieval function for materials
5. Mobile audit: modify app to post answers to server; remove any client-side trust logic
6. Add tests: unit tests for scoring, integration tests for visibility filtering
7. Seed script: import past questions and tag bar-subjects

Acceptance criteria
- Bar student users only receive questions in allowed Bar subjects
- AI-generated questions must be approved before appearing to students (unless feature-flagged)
- Mobile scoring must match server scoring in 100% of sampled tests
- Admin can bulk-import past questions and set allowed_roles

Files to change (suggested)
- server/db/migrations/* (create tables)
- server/api/questions.ts (endpoints)
- server/api/answers.ts (scoring)
- server/middleware/roles.ts
- components/admin/QuestionReview.tsx
- mobile/src/screens/ExamScreen.tsx (audit scoring)

Rollout & QA
- Feature-flag AI-generated questions
- Roll out admin review UI first
- Run limited beta with logged metrics on hallucinations
- Human sampling review weekly until hallucination rate is acceptable

Notes
- Keep AI-generated questions in a quarantined state until approved
- Store provenance and LLM confidence for audit

Next steps
- If approved, implement DB migration and server endpoints first, then admin UI and mobile audit.

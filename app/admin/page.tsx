"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { adminApi, type PdfDocument, type AdminStats } from "@/lib/api/admin";
import { NeonButton } from "@/components/ui/NeonButton";
import { cn } from "@/lib/utils";

type BankStat = { subject: string; total: number; by_difficulty: Record<string, number>; by_type: Record<string, number>; essays: number };

const SUBJECTS = [
  { id: "civil_procedure",    label: "Civil Procedure",    track: "law_school_track"    },
  { id: "criminal_procedure", label: "Criminal Procedure", track: "law_school_track"    },
  { id: "property_law",       label: "Property Law",       track: "law_school_track"    },
  { id: "corporate_law",      label: "Corporate Law",      track: "law_school_track"    },
  { id: "legal_ethics",       label: "Legal Ethics",       track: "law_school_track"    },
  { id: "constitutional_law", label: "Constitutional Law", track: "law_school_track"    },
  { id: "evidence_law",       label: "Evidence Law",       track: "law_school_track"    },
  { id: "law_of_contract",    label: "Law of Contract",    track: "undergraduate_track" },
  { id: "law_of_torts",       label: "Law of Torts",       track: "undergraduate_track" },
  { id: "criminal_law",       label: "Criminal Law",       track: "undergraduate_track" },
  { id: "equity_and_trusts",  label: "Equity & Trusts",    track: "undergraduate_track" },
  { id: "family_law",         label: "Family Law",         track: "undergraduate_track" },
];

export default function AdminPage() {
  const [adminKey,   setAdminKey]   = useState("");
  const [authed,     setAuthed]     = useState(false);
  const [authError,  setAuthError]  = useState("");

  const [stats,  setStats]  = useState<AdminStats | null>(null);
  const [pdfs,   setPdfs]   = useState<PdfDocument[]>([]);
  const [banks,  setBanks]  = useState<BankStat[]>([]);
  const [tab,    setTab]    = useState<"upload" | "past" | "pdfs" | "banks" | "stats">("upload");

  const [selectedFile,    setSelectedFile]    = useState<File | null>(null);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0].id);
  const [uploading,       setUploading]       = useState(false);
  const [uploadResult,    setUploadResult]    = useState<{ ok: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [chunks, setChunks] = useState<{ id: string; chunk_index: number; word_count: number; used_count: number; preview: string }[]>([]);

  // Per-subject action messages for Banks tab
  const [subjectMsg, setSubjectMsg] = useState<Record<string, string>>({});
  const setMsg = (id: string, msg: string) => setSubjectMsg((m) => ({ ...m, [id]: msg }));
  const clearMsg = (id: string, delay = 7000) =>
    setTimeout(() => setSubjectMsg((m) => ({ ...m, [id]: "" })), delay);

  // Past Questions import state
  const [pastJson,     setPastJson]     = useState("");
  const [pastFile,     setPastFile]     = useState<File | null>(null);
  const [pastSubject,  setPastSubject]  = useState(SUBJECTS[0].id);
  const [pastYear,     setPastYear]     = useState(new Date().getFullYear());
  const [pastTrack,    setPastTrack]    = useState("law_school_track");
  const [pastDiff,     setPastDiff]     = useState("medium");
  const [importing,    setImporting]    = useState(false);
  const [importResult, setImportResult] = useState<{ ok: boolean; message: string } | null>(null);
  const pastFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = async () => {
    setAuthError("");
    try {
      await adminApi.getStats(adminKey);
      setAuthed(true);
    } catch {
      setAuthError("Invalid admin key");
    }
  };

  const refreshBanks = () => adminApi.getBankStats(adminKey).then(setBanks).catch(console.error);

  useEffect(() => {
    if (!authed) return;
    adminApi.getStats(adminKey).then(setStats).catch(console.error);
    adminApi.listPdfs(adminKey).then(setPdfs).catch(console.error);
    refreshBanks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, adminKey]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const subject = SUBJECTS.find((s) => s.id === selectedSubject)!;
      const result = await adminApi.uploadPdf(adminKey, selectedFile, subject.id, subject.track);
      setUploadResult({ ok: true, message: `✓ ${result.message} — ${result.chunkCount} chunks from ${result.pageCount} pages. Questions generating in background…` });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      const [updated, updatedStats] = await Promise.all([adminApi.listPdfs(adminKey), adminApi.getStats(adminKey)]);
      setPdfs(updated);
      setStats(updatedStats);
    } catch (err) {
      setUploadResult({ ok: false, message: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its questions?`)) return;
    try {
      await adminApi.deletePdf(adminKey, id);
      setPdfs((prev) => prev.filter((p) => p.id !== id));
      const updatedStats = await adminApi.getStats(adminKey);
      setStats(updatedStats);
      refreshBanks();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleExpandDoc = async (id: string) => {
    if (expandedDoc === id) { setExpandedDoc(null); setChunks([]); return; }
    setExpandedDoc(id);
    try { setChunks(await adminApi.getChunks(adminKey, id)); }
    catch { setChunks([]); }
  };

  const handleRegenerate = async (subjectId: string) => {
    setMsg(subjectId, "⏳ Generating MCQ and essay questions…");
    try {
      const subject = SUBJECTS.find((s) => s.id === subjectId);
      if (!subject) throw new Error("Subject not found");

      const res = await adminApi.generateMixed(adminKey, subjectId, subject.track, 10);
      const mcqCount = res.created.filter((q: any) => q.type === "mcq").length;
      const essayCount = res.created.filter((q: any) => q.type === "essay").length;
      setMsg(subjectId, `✓ Generated ${mcqCount} MCQs + ${essayCount} essays. Updating…`);

      // Wait 5 seconds for database to process all writes before refreshing
      setTimeout(async () => {
        await refreshBanks();
        setMsg(subjectId, `✓ Done! Updated question bank.`);
        clearMsg(subjectId, 5000);
      }, 5000);
    } catch (err) {
      setMsg(subjectId, `❌ ${err instanceof Error ? err.message : "Failed"}`);
      clearMsg(subjectId, 5000);
    }
  };

  const handlePurge = async (subjectId: string, label: string) => {
    if (!confirm(`Delete ALL "${label}" questions and regenerate from existing PDFs? This cannot be undone.`)) return;
    setMsg(subjectId, "⏳ Purging questions…");
    try {
      const res = await adminApi.purgeSubject(adminKey, subjectId);
      setMsg(subjectId, res.message);
      clearMsg(subjectId, 8000);
      setTimeout(() => refreshBanks(), 10000);
    } catch (err) {
      setMsg(subjectId, `❌ ${err instanceof Error ? err.message : "Failed"}`);
      clearMsg(subjectId, 5000);
    }
  };

  const formatBytes = (b: number) =>
    b > 1024 * 1024 ? `${(b / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

  // ── AUTH GATE ──────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cyber-card p-8 w-full max-w-sm space-y-5"
        >
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <Image
                src="/logo.png.png"
                alt="Legal Ninja Logo"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Admin Portal</h1>
            <p className="text-gray-500 text-sm mt-1">Legal Ninja</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Admin Key</label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter admin secret key"
              className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-cyber-cyan transition-colors"
            />
            {authError && <p className="text-cyber-red text-xs mt-1">{authError}</p>}
          </div>
          <NeonButton variant="cyan" fullWidth onClick={handleLogin}>Enter</NeonButton>
        </motion.div>
      </div>
    );
  }

  // ── MAIN PANEL ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-16">

      {/* Sticky header */}
      <div className="sticky top-0 z-40 border-b px-4 py-3 flex items-center justify-between"
           style={{ background: "var(--cyber-card-bg)", backdropFilter: "blur(16px)", borderColor: "var(--cyber-border)" }}>
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src="/logo.png.png"
              alt="Legal Ninja Logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-black text-sm uppercase tracking-widest neon-text-cyan">Admin Portal</h1>
            {stats && (
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {stats.total_users} users · {stats.total_pdfs} PDFs · {stats.total_questions_cached} questions
              </p>
            )}
          </div>
        </div>
        <NeonButton variant="ghost" size="sm" onClick={() => setAuthed(false)}>Logout</NeonButton>
      </div>

      {/* Sticky tab bar */}
      <div className="sticky top-[57px] z-30 flex gap-2 px-4 py-3 overflow-x-auto border-b"
           style={{ background: "var(--cyber-card-bg)", backdropFilter: "blur(16px)", borderColor: "var(--cyber-border)" }}>
        {(["upload", "past", "banks", "pdfs", "stats"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === "banks") refreshBanks(); }}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest border whitespace-nowrap transition-all shrink-0",
              tab === t
                ? "border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10"
                : "border-cyber-border hover:border-cyber-cyan/40"
            )}
            style={{ color: tab === t ? "var(--cyber-cyan)" : "var(--text-muted)" }}
          >
            {t === "upload" ? "📤 Upload PDF"
              : t === "past"  ? "📝 Past Questions"
              : t === "banks" ? "🏦 Question Banks"
              : t === "pdfs"  ? "📚 Manage PDFs"
              : "📊 Stats"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 space-y-4">

        {/* ── UPLOAD ── */}
        {tab === "upload" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="cyber-card p-6 space-y-5">
              <div>
                <h2 className="font-black text-sm uppercase tracking-widest" style={{ color: "var(--cyber-cyan)" }}>Upload Law PDF</h2>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Upload textbooks or past papers. AI generates questions grounded in the content. Use <strong>text-based PDFs</strong> (not scanned images).
                </p>
              </div>

              {/* Subject grid */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-black block mb-2" style={{ color: "var(--text-muted)" }}>Subject</label>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECTS.map((s) => (
                    <button key={s.id} onClick={() => setSelectedSubject(s.id)}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-xs font-bold border text-left transition-all",
                        selectedSubject === s.id
                          ? "border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10"
                          : "border-cyber-border hover:border-cyber-cyan/40"
                      )}
                      style={{ color: selectedSubject === s.id ? "var(--cyber-cyan)" : "var(--text-muted)" }}
                    >
                      {s.label}
                      <span className="block text-[9px] mt-0.5 opacity-60">{s.track === "law_school_track" ? "Law School" : "Undergraduate"}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File picker */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-black block mb-2" style={{ color: "var(--text-muted)" }}>PDF File (max 50 MB)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                    selectedFile ? "border-cyber-green bg-cyber-green/5" : "border-cyber-border hover:border-cyber-cyan/50 hover:bg-cyber-cyan/5"
                  )}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
                  {selectedFile ? (
                    <div>
                      <p className="text-cyber-green font-bold text-sm">📄 {selectedFile.name}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{formatBytes(selectedFile.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-4xl mb-2">📂</p>
                      <p className="font-bold text-sm" style={{ color: "var(--text-base)" }}>Click to select a PDF</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>text-based PDFs only</p>
                    </div>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {uploadResult && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-xs p-3 rounded-lg border font-mono"
                    style={{
                      color: uploadResult.ok ? "var(--cyber-green)" : "var(--cyber-red)",
                      borderColor: uploadResult.ok ? "color-mix(in srgb, var(--cyber-green) 25%, transparent)" : "color-mix(in srgb, var(--cyber-red) 25%, transparent)",
                      background: uploadResult.ok ? "color-mix(in srgb, var(--cyber-green) 8%, transparent)" : "color-mix(in srgb, var(--cyber-red) 8%, transparent)",
                    }}
                  >
                    {uploadResult.message}
                  </motion.p>
                )}
              </AnimatePresence>

              <NeonButton variant="cyan" fullWidth size="lg" onClick={handleUpload} disabled={!selectedFile || uploading}>
                {uploading ? "Processing PDF…" : "📤 Upload & Generate Questions"}
              </NeonButton>
              {uploading && <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>Parsing PDF. Large files may take 30–60 seconds…</p>}
            </div>
          </motion.div>
        )}

        {/* ── PAST QUESTIONS IMPORT ── */}
        {tab === "past" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="cyber-card p-6 space-y-5">
              <div>
                <h2 className="font-black text-sm uppercase tracking-widest" style={{ color: "var(--cyber-gold)" }}>Import Past Exam Questions</h2>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Upload a <strong>Past Question PDF</strong> for AI extraction, or paste a JSON array.
                </p>
              </div>

              {/* Subject + Year + Track + Difficulty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-black block mb-1.5" style={{ color: "var(--text-muted)" }}>Subject</label>
                  <select value={pastSubject} onChange={(e) => setPastSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none"
                    style={{ background: "var(--cyber-card-bg)", borderColor: "var(--cyber-border)", color: "var(--text-base)" }}>
                    {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-black block mb-1.5" style={{ color: "var(--text-muted)" }}>Exam Year</label>
                  <input type="number" value={pastYear} onChange={(e) => setPastYear(Number(e.target.value))}
                    min={1990} max={2030}
                    className="w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none"
                    style={{ background: "var(--cyber-card-bg)", borderColor: "var(--cyber-border)", color: "var(--text-base)" }} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-black block mb-1.5" style={{ color: "var(--text-muted)" }}>Track</label>
                  <select value={pastTrack} onChange={(e) => setPastTrack(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none"
                    style={{ background: "var(--cyber-card-bg)", borderColor: "var(--cyber-border)", color: "var(--text-base)" }}>
                    <option value="law_school_track">Law School</option>
                    <option value="undergraduate_track">Undergraduate</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-black block mb-1.5" style={{ color: "var(--text-muted)" }}>Difficulty</label>
                  <select value={pastDiff} onChange={(e) => setPastDiff(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none"
                    style={{ background: "var(--cyber-card-bg)", borderColor: "var(--cyber-border)", color: "var(--text-base)" }}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              {/* PDF Picker for Past Questions */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-black block mb-2" style={{ color: "var(--text-muted)" }}>Option A: Upload PDF (Recommended)</label>
                <div
                  onClick={() => pastFileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                    pastFile ? "border-cyber-gold bg-cyber-gold/5" : "border-cyber-border hover:border-cyber-gold/50 hover:bg-cyber-gold/5"
                  )}
                >
                  <input ref={pastFileInputRef} type="file" accept=".pdf,application/pdf" className="hidden"
                    onChange={(e) => {
                      setPastFile(e.target.files?.[0] ?? null);
                      if (e.target.files?.[0]) setPastJson("");
                    }} />
                  {pastFile ? (
                    <div>
                      <p className="text-cyber-gold font-bold text-sm">📄 {pastFile.name}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{formatBytes(pastFile.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl mb-1">📄</p>
                      <p className="font-bold text-xs" style={{ color: "var(--text-base)" }}>Select Past Question PDF</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cyber-border"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-cyber-card-bg px-2 text-gray-500">OR</span></div>
              </div>

              {/* JSON input */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-black block mb-1.5" style={{ color: "var(--text-muted)" }}>Option B: Paste JSON Array</label>
                <textarea
                  value={pastJson}
                  onChange={(e) => {
                    setPastJson(e.target.value);
                    if (e.target.value.trim()) setPastFile(null);
                  }}
                  rows={6}
                  placeholder={`[\n  {\n    "question": "What is the doctrine of lis pendens?",\n    "options": {\n      "A": "A rule of evidence",\n      "B": "A doctrine affecting pending litigation",\n      "C": "A type of legal brief",\n      "D": "A court procedure"\n    },\n    "correct_option": "B",\n    "explanation": "Lis pendens means a pending suit...",\n    "topic": "Property transfers"\n  }\n]`}
                  className="w-full px-4 py-3 rounded-xl text-xs border font-mono focus:outline-none"
                  style={{ background: "var(--cyber-card-bg)", borderColor: "var(--cyber-border)", color: "var(--text-base)", resize: "vertical" }}
                />
              </div>

              <AnimatePresence>
                {importResult && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-xs p-3 rounded-lg border font-mono"
                    style={{
                      color: importResult.ok ? "var(--cyber-green)" : "var(--cyber-red)",
                      borderColor: importResult.ok ? "color-mix(in srgb, var(--cyber-green) 25%, transparent)" : "color-mix(in srgb, var(--cyber-red) 25%, transparent)",
                      background: importResult.ok ? "color-mix(in srgb, var(--cyber-green) 8%, transparent)" : "color-mix(in srgb, var(--cyber-red) 8%, transparent)",
                    }}
                  >
                    {importResult.message}
                  </motion.p>
                )}
              </AnimatePresence>

              <NeonButton variant="gold" fullWidth size="lg" disabled={(!pastJson.trim() && !pastFile) || importing}
                onClick={async () => {
                  setImporting(true);
                  setImportResult(null);
                  try {
                    let res;
                    if (pastFile) {
                      res = await adminApi.importPastQuestions(adminKey, {
                        file: pastFile,
                        subject: pastSubject,
                        track: pastTrack,
                        year: pastYear,
                      });
                      setImportResult({ ok: true, message: `✅ PDF uploaded. AI is extracting questions for ${pastYear} in the background.` });
                      setPastFile(null);
                      if (pastFileInputRef.current) pastFileInputRef.current.value = "";
                    } else {
                      const parsed = JSON.parse(pastJson);
                      if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array");
                      const enriched = parsed.map((q: any) => ({
                        ...q,
                        subject: pastSubject,
                        track: pastTrack,
                        difficulty: pastDiff,
                        year: pastYear,
                      }));
                      res = await adminApi.importPastQuestions(adminKey, { questions: enriched, year: pastYear });
                      setImportResult({ ok: true, message: `✅ Imported ${res.imported} past exam questions (${pastYear})` });
                      setPastJson("");
                    }
                    refreshBanks();
                  } catch (err) {
                    setImportResult({ ok: false, message: err instanceof Error ? err.message : "Import failed" });
                  } finally {
                    setImporting(false);
                  }
                }}
              >
                {importing ? "Processing…" : pastFile ? "📤 Extract from PDF" : `📝 Import ${pastYear} JSON`}
              </NeonButton>
            </div>
          </motion.div>
        )}

        {/* ── QUESTION BANKS ── */}
        {tab === "banks" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Upload a PDF first, then use <strong style={{ color: "var(--cyber-cyan)" }}>Generate</strong> to add questions.
                Use <strong style={{ color: "var(--cyber-red)" }}>Purge</strong> to wipe bad questions and start fresh.
              </p>
              <button onClick={refreshBanks}
                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border shrink-0 ml-3"
                style={{ borderColor: "var(--cyber-border)", color: "var(--text-muted)" }}>
                Refresh
              </button>
            </div>

            {SUBJECTS.map((s) => {
              const bank  = banks.find((b) => b.subject === s.id);
              const total = bank?.total ?? 0;
              const msg   = subjectMsg[s.id];
              return (
                <div key={s.id} className="cyber-card p-4 space-y-3">
                  {/* Top row: name + count */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-sm" style={{ color: "var(--text-base)" }}>{s.label}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {s.track === "law_school_track" ? "Law School" : "Undergraduate"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn("text-xl font-black font-mono", total > 0 ? "text-cyber-green" : "text-gray-600")}>
                        {total}
                      </p>
                      <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>questions</p>
                    </div>
                  </div>

                  {/* MCQ Difficulty breakdown */}
                  {total > 0 && bank?.by_difficulty && (
                    <div className="space-y-2">
                      <p className="text-[9px] uppercase tracking-widest font-black" style={{ color: "var(--text-muted)" }}>MCQ by difficulty:</p>
                      <div className="flex gap-2">
                        {["easy", "medium", "hard", "expert"].map((d) => {
                          const label = d === "easy" ? "Easy" : d === "medium" ? "Med" : d === "hard" ? "Hard" : "Exp";
                          return (
                            <div key={d} className="flex-1 text-center py-1.5 rounded-lg text-[9px] font-black uppercase"
                              style={{ background: "var(--cyber-border)", color: "var(--text-muted)" }}>
                              <p className="text-xs font-black font-mono" style={{ color: "var(--cyber-cyan)" }}>
                                {bank.by_difficulty[d] ?? 0}
                              </p>
                              {label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Essay count */}
                  {total > 0 && bank && (
                    <div className="flex items-center justify-between px-2 py-1.5 rounded-lg text-[9px] font-black"
                      style={{ background: "var(--cyber-border)", color: "var(--text-muted)" }}>
                      <span>Essays:</span>
                      <p className="text-xs font-black font-mono" style={{ color: bank.essays > 0 ? "var(--cyber-green)" : "var(--text-muted)" }}>
                        {bank.essays}
                      </p>
                    </div>
                  )}

                  {total === 0 && (
                    <p className="text-xs" style={{ color: "var(--cyber-red)" }}>
                      No questions yet — upload a PDF for this subject then click Generate.
                    </p>
                  )}

                  {/* Status message */}
                  {msg && (
                    <p className="text-[10px] font-mono" style={{ color: "var(--cyber-cyan)" }}>{msg}</p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <NeonButton
                      variant="cyan"
                      size="sm"
                      fullWidth
                      onClick={() => handleRegenerate(s.id)}
                    >
                      ⚡ Generate Questions
                    </NeonButton>
                    <NeonButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePurge(s.id, s.label)}
                      className="hover:border-cyber-red hover:text-cyber-red shrink-0"
                    >
                      🗑 Purge
                    </NeonButton>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ── MANAGE PDFs ── */}
        {tab === "pdfs" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {pdfs.length === 0 ? (
              <div className="cyber-card p-10 text-center" style={{ color: "var(--text-muted)" }}>
                <p className="text-3xl mb-3">📭</p>
                <p className="text-sm font-bold">No PDFs uploaded yet.</p>
                <p className="text-xs mt-1">Go to the Upload tab to add your first PDF.</p>
              </div>
            ) : pdfs.map((doc) => (
              <div key={doc.id} className="cyber-card border overflow-hidden" style={{ borderColor: "var(--cyber-border)" }}>
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: "var(--text-base)" }}>📄 {doc.original_name}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span className="font-bold" style={{ color: "var(--cyber-cyan)" }}>{doc.subject.replace(/_/g, " ")}</span>
                      <span>{doc.chunk_count} chunks</span>
                      <span>{doc.page_count} pages</span>
                      <span>{formatBytes(doc.file_size_bytes)}</span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                      {new Date(doc.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <NeonButton variant="ghost" size="sm" onClick={() => handleExpandDoc(doc.id)}>
                      {expandedDoc === doc.id ? "Hide" : "Preview"}
                    </NeonButton>
                    <NeonButton variant="ghost" size="sm"
                      className="hover:border-cyber-cyan hover:text-cyber-cyan"
                      onClick={async () => {
                        await adminApi.repopulateBank(adminKey, doc.id).catch(console.error);
                        alert("Question generation started. Check Question Banks tab in ~2 minutes.");
                      }}>
                      Regen
                    </NeonButton>
                    <NeonButton variant="ghost" size="sm"
                      className="hover:border-cyber-red hover:text-cyber-red"
                      onClick={() => handleDelete(doc.id, doc.original_name)}>
                      Delete
                    </NeonButton>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedDoc === doc.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t" style={{ borderColor: "var(--cyber-border)", background: "var(--cyber-bg)" }}
                    >
                      <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                        <p className="text-[10px] uppercase tracking-widest font-black mb-2" style={{ color: "var(--text-muted)" }}>Sample chunks</p>
                        {chunks.slice(0, 8).map((c) => (
                          <div key={c.id} className="text-xs p-3 rounded-lg border" style={{ background: "var(--cyber-card-bg)", borderColor: "var(--cyber-border)" }}>
                            <div className="flex justify-between mb-1" style={{ color: "var(--text-muted)" }}>
                              <span>Chunk {c.chunk_index + 1}</span>
                              <span>{c.word_count} words · used {c.used_count}×</span>
                            </div>
                            <p className="line-clamp-2" style={{ color: "var(--text-base)" }}>{c.preview}…</p>
                          </div>
                        ))}
                        {chunks.length > 8 && (
                          <p className="text-[10px] text-center" style={{ color: "var(--text-muted)" }}>+{chunks.length - 8} more chunks</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── STATS ── */}
        {tab === "stats" && stats && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Users",     value: stats.total_users.toLocaleString(),            color: "var(--cyber-cyan)"   },
                { label: "Game Sessions",   value: stats.total_sessions.toLocaleString(),          color: "var(--cyber-purple)" },
                { label: "Questions Banked",value: stats.total_questions_cached.toLocaleString(),  color: "var(--cyber-green)"  },
                { label: "PDFs Uploaded",   value: stats.total_pdfs.toLocaleString(),              color: "var(--cyber-gold)"   },
                { label: "PDF Chunks",      value: stats.total_pdf_chunks.toLocaleString(),        color: "var(--cyber-cyan)"   },
                { label: "Revenue (NGN)",   value: `₦${stats.total_revenue_ngn.toLocaleString()}`, color: "var(--cyber-green)"  },
              ].map((s) => (
                <div key={s.label} className="cyber-card p-5 text-center">
                  <p className="text-3xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] mt-1 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

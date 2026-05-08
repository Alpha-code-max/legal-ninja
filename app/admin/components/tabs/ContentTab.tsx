"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api/admin";
import { NeonButton } from "@/components/ui/NeonButton";

const SUBJECTS = [
  "civil_procedure",
  "criminal_procedure",
  "property_law",
  "corporate_law",
  "legal_ethics",
  "constitutional_law",
  "evidence_law",
  "law_of_contract",
  "law_of_torts",
  "criminal_law",
  "equity_and_trusts",
  "family_law",
];

interface Props {
  adminKey: string;
}

export function ContentTab({ adminKey }: Props) {
  const [activeTab, setActiveTab] = useState<"banks" | "pending" | "pdfs" | "generate">("banks");
  const [loading, setLoading] = useState(true);
  const [banks, setBanks] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate questions state
  const [genSubject, setGenSubject] = useState(SUBJECTS[0]);
  const [genTrack, setGenTrack] = useState("law_school_track");
  const [genCount, setGenCount] = useState(5);
  const [genDifficulty, setGenDifficulty] = useState("medium");
  const [genType, setGenType] = useState("mixed");
  const [genResult, setGenResult] = useState<any>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      let b, p, pdfList;

      try {
        b = await adminApi.getBankStats(adminKey);
      } catch (err) {
        throw new Error(`Banks: ${err instanceof Error ? err.message : String(err)}`);
      }

      try {
        p = await adminApi.getPendingQuestions(adminKey);
      } catch (err) {
        throw new Error(`Pending: ${err instanceof Error ? err.message : String(err)}`);
      }

      try {
        pdfList = await adminApi.listPdfs(adminKey);
      } catch (err) {
        throw new Error(`PDFs: ${err instanceof Error ? err.message : String(err)}`);
      }

      setBanks(b || []);
      setPending(p || []);
      setPdfs(pdfList || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Failed to load content:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setProcessing("generate");
    setGenResult(null);
    try {
      const res = await fetch("/api/admin/questions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          subject: genSubject,
          track: genTrack,
          difficulty: genDifficulty,
          count: genCount,
          type: genType,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setGenResult({ ok: true, count: data.created?.length || 0, message: `Generated ${data.created?.length || 0} questions` });
        reload();
      } else {
        setGenResult({ ok: false, message: data.error });
      }
    } catch (err) {
      setGenResult({ ok: false, message: String(err) });
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    reload();
  }, [adminKey]);

  const handlePurge = async (subject: string) => {
    if (!confirm(`Purge all questions for ${subject}?`)) return;
    setProcessing(`purge-${subject}`);
    try {
      await adminApi.purgeSubject(adminKey, subject);
      reload();
    } catch (err) {
      console.error("Purge failed:", err);
    } finally {
      setProcessing(null);
    }
  };

  const handleRegenerate = async (subject: string) => {
    setProcessing(`regen-${subject}`);
    try {
      await adminApi.regenerateSubject(adminKey, subject);
      reload();
    } catch (err) {
      console.error("Regenerate failed:", err);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeletePdf = async (id: string) => {
    if (!confirm("Delete this PDF?")) return;
    setProcessing(`del-${id}`);
    try {
      await adminApi.deletePdf(adminKey, id);
      reload();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div
          className="p-3 rounded-lg text-sm border"
          style={{
            background: "rgba(255, 45, 85, 0.1)",
            borderColor: "var(--cyber-red)",
            color: "var(--cyber-red)",
          }}
        >
          {error}
          <button
            onClick={reload}
            className="ml-2 font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto" style={{ borderColor: "var(--cyber-border)" }}>
        {[
          { id: "banks", label: "Question Banks" },
          { id: "pending", label: `Pending (${pending.length})` },
          { id: "pdfs", label: `PDFs (${pdfs.length})` },
          { id: "generate", label: "Generate" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-cyber-cyan text-cyber-cyan"
                : "border-transparent"
            }`}
            style={activeTab !== tab.id ? { color: "var(--text-muted)" } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Banks */}
      {activeTab === "banks" && (
        <div className="space-y-3">
          {loading ? (
            <div style={{ color: "var(--text-muted)" }}>Loading...</div>
          ) : banks.length === 0 ? (
            <div style={{ color: "var(--text-muted)" }}>No banks</div>
          ) : (
            banks.map((bank) => (
              <div
                key={bank.subject}
                className="cyber-card p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black">{bank.subject.replace(/_/g, " ")}</h4>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {bank.total} total questions
                    </p>
                  </div>
                  <span className="text-sm font-mono neon-text-cyan whitespace-nowrap">{bank.total} Q</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p style={{ color: "var(--text-muted)" }}>Easy</p>
                    <p className="neon-text-green font-mono">{bank.by_difficulty?.easy ?? 0}</p>
                  </div>
                  <div>
                    <p style={{ color: "var(--text-muted)" }}>Medium</p>
                    <p className="neon-text-gold font-mono">{bank.by_difficulty?.medium ?? 0}</p>
                  </div>
                  <div>
                    <p style={{ color: "var(--text-muted)" }}>Hard</p>
                    <p className="neon-text-red font-mono">{bank.by_difficulty?.hard ?? 0}</p>
                  </div>
                </div>

                <div className="text-xs">
                  <p style={{ color: "var(--text-muted)" }}>
                    MCQs: <span className="neon-text-cyan">{bank.by_type?.mcq ?? 0}</span> | Essays: <span className="neon-text-purple">{bank.essays ?? 0}</span>
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <NeonButton
                    variant="green"
                    size="sm"
                    onClick={() => handleRegenerate(bank.subject)}
                    disabled={processing === `regen-${bank.subject}`}
                    className="flex-1"
                  >
                    {processing === `regen-${bank.subject}` ? "..." : "Regenerate"}
                  </NeonButton>
                  <NeonButton
                    variant="red"
                    size="sm"
                    onClick={() => handlePurge(bank.subject)}
                    disabled={processing === `purge-${bank.subject}`}
                    className="flex-1"
                  >
                    {processing === `purge-${bank.subject}` ? "..." : "Purge"}
                  </NeonButton>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pending Review */}
      {activeTab === "pending" && (
        <div className="space-y-3">
          {loading ? (
            <div style={{ color: "var(--text-muted)" }}>Loading...</div>
          ) : pending.length === 0 ? (
            <div style={{ color: "var(--text-muted)" }}>No pending questions</div>
          ) : (
            pending.slice(0, 20).map((q: any) => (
              <div
                key={q._id}
                className="cyber-card p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-black">{q.question.substring(0, 80)}...</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {q.subject} • {q.type.toUpperCase()} • {q.difficulty}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch(`/api/admin/questions/${q._id}/approve`, {
                        method: "PATCH",
                        headers: { "x-admin-key": adminKey },
                      });
                      setPending(pending.filter((qq) => qq._id !== q._id));
                    }}
                    className="px-2 py-1 text-xs rounded border font-bold whitespace-nowrap"
                    style={{
                      borderColor: "var(--cyber-green)",
                      color: "var(--cyber-green)",
                    }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={async () => {
                      await fetch(`/api/admin/questions/${q._id}/reject`, {
                        method: "PATCH",
                        headers: { "x-admin-key": adminKey },
                      });
                      setPending(pending.filter((qq) => qq._id !== q._id));
                    }}
                    className="px-2 py-1 text-xs rounded border font-bold whitespace-nowrap"
                    style={{
                      borderColor: "var(--cyber-red)",
                      color: "var(--cyber-red)",
                    }}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Generate Questions */}
      {activeTab === "generate" && (
        <div className="cyber-card p-6 space-y-4">
          <h3 className="text-lg font-black">Generate Questions</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-black mb-2">Subject</label>
              <select
                value={genSubject}
                onChange={(e) => setGenSubject(e.target.value)}
                className="w-full p-3 rounded-lg border"
                style={{
                  borderColor: "var(--cyber-border)",
                  background: "var(--cyber-bg)",
                  color: "var(--text-base)",
                }}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black mb-2">Track</label>
                <select
                  value={genTrack}
                  onChange={(e) => setGenTrack(e.target.value)}
                  className="w-full p-3 rounded-lg border"
                  style={{
                    borderColor: "var(--cyber-border)",
                    background: "var(--cyber-bg)",
                    color: "var(--text-base)",
                  }}
                >
                  <option value="law_school_track">Law School</option>
                  <option value="undergraduate_track">Undergraduate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black mb-2">Difficulty</label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value)}
                  className="w-full p-3 rounded-lg border"
                  style={{
                    borderColor: "var(--cyber-border)",
                    background: "var(--cyber-bg)",
                    color: "var(--text-base)",
                  }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black mb-2">Type</label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value)}
                  className="w-full p-3 rounded-lg border"
                  style={{
                    borderColor: "var(--cyber-border)",
                    background: "var(--cyber-bg)",
                    color: "var(--text-base)",
                  }}
                >
                  <option value="mcq">MCQ Only</option>
                  <option value="essay">Essay Only</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black mb-2">Count</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-full p-3 rounded-lg border"
                  style={{
                    borderColor: "var(--cyber-border)",
                    background: "var(--cyber-bg)",
                    color: "var(--text-base)",
                  }}
                />
              </div>
            </div>

            {genResult && (
              <div
                className="p-3 rounded-lg text-sm border"
                style={{
                  background: genResult.ok ? "rgba(34, 255, 136, 0.1)" : "rgba(255, 45, 85, 0.1)",
                  borderColor: genResult.ok ? "var(--cyber-green)" : "var(--cyber-red)",
                  color: genResult.ok ? "var(--cyber-green)" : "var(--cyber-red)",
                }}
              >
                {genResult.message}
              </div>
            )}

            <NeonButton
              variant="purple"
              fullWidth
              onClick={handleGenerate}
              disabled={processing === "generate"}
            >
              {processing === "generate" ? "Generating..." : "Generate Questions"}
            </NeonButton>
          </div>
        </div>
      )}

      {/* PDFs */}
      {activeTab === "pdfs" && (
        <div className="space-y-3">
          {loading ? (
            <div style={{ color: "var(--text-muted)" }}>Loading...</div>
          ) : pdfs.length === 0 ? (
            <div className="cyber-card p-4 text-center space-y-3">
              <p style={{ color: "var(--text-muted)" }}>No PDFs uploaded yet</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Go to the <strong>Uploads</strong> tab to upload a PDF for question generation
              </p>
            </div>
          ) : (
            pdfs.map((pdf: any) => (
              <div
                key={pdf.id}
                className="cyber-card p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm truncate">{pdf.original_name}</h4>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {pdf.subject} • {pdf.track === "law_school_track" ? "Law School" : "Undergrad"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {pdf.chunk_count} chunks • {pdf.page_count} pages • {(pdf.file_size_bytes / 1024 / 1024).toFixed(1)}MB
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <NeonButton
                    variant="cyan"
                    size="sm"
                    onClick={() => {
                      setProcessing(`repop-${pdf.id}`);
                      adminApi.repopulateBank(adminKey, pdf.id)
                        .then(() => reload())
                        .catch(console.error)
                        .finally(() => setProcessing(null));
                    }}
                    disabled={processing === `repop-${pdf.id}`}
                    className="flex-1"
                  >
                    {processing === `repop-${pdf.id}` ? "..." : "Repopulate"}
                  </NeonButton>
                  <NeonButton
                    variant="red"
                    size="sm"
                    onClick={() => handleDeletePdf(pdf.id)}
                    disabled={processing === `del-${pdf.id}`}
                    className="flex-1"
                  >
                    {processing === `del-${pdf.id}` ? "..." : "Delete"}
                  </NeonButton>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

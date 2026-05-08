"use client";
import { useState } from "react";
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

export function UploadsTab({ adminKey }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [track, setTrack] = useState("law_school_track");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await adminApi.uploadPdf(adminKey, file, subject, track);
      setResult({ ok: true, message: result.message });
      setFile(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setResult({ ok: false, message: msg });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* PDF Upload */}
      <div className="cyber-card p-6 space-y-4">
        <h3 className="text-lg font-black">Upload PDF</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-black mb-2">PDF File</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-3 rounded-lg border"
              style={{
                borderColor: "var(--cyber-border)",
                background: "var(--cyber-bg)",
                color: "var(--text-base)",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-black mb-2">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
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

          <div>
            <label className="block text-xs font-black mb-2">Track</label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value)}
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

          {result && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                background: result.ok ? "rgba(34, 255, 136, 0.1)" : "rgba(255, 45, 85, 0.1)",
                color: result.ok ? "var(--cyber-green)" : "var(--cyber-red)",
                border: `1px solid ${result.ok ? "var(--cyber-green)" : "var(--cyber-red)"}`,
              }}
            >
              {result.message}
            </div>
          )}

          <NeonButton
            variant="cyan"
            fullWidth
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </NeonButton>
        </div>
      </div>

      {/* PDFs List would go here */}
      <div className="cyber-card p-6 space-y-4">
        <h3 className="text-lg font-black">PDFs (TODO: List & Management)</h3>
        <p style={{ color: "var(--text-muted)" }} className="text-sm">
          PDF management UI coming soon. Use the backend API to manage uploaded documents.
        </p>
      </div>
    </div>
  );
}

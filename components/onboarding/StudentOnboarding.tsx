"use client";
import { useState } from "react";
import { api } from "@/lib/api/client";
import { useUserStore } from "@/lib/store/user-store";
import { NeonButton } from "@/components/ui/NeonButton";
import { LAW_SCHOOLS, UNDERGRAD_INSTITUTIONS } from "@/lib/config/universities";

interface StudentOnboardingProps {
  onComplete: () => void;
}

export function StudentOnboarding({ onComplete }: StudentOnboardingProps) {
  const [step, setStep] = useState<"track" | "university">("track");
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("");
  const [customUniversity, setCustomUniversity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const updateUser = useUserStore((s) => s.updateUser);

  const universities = selectedTrack === "law_school_track" ? LAW_SCHOOLS : UNDERGRAD_INSTITUTIONS;

  const handleTrackSelect = (track: string) => {
    setSelectedTrack(track);
    setStep("university");
  };

  const handleUniversitySubmit = async () => {
    let university = "";

    if (selectedTrack === "law_school_track") {
      // Law school - must select from dropdown
      if (!selectedUniversity || !selectedUniversity.trim()) {
        alert("Please select your law school campus");
        return;
      }
      university = selectedUniversity;
    } else {
      // Undergraduate - can select or enter custom
      if (selectedUniversity === "Other") {
        if (!customUniversity || !customUniversity.trim()) {
          alert("Please enter your university name");
          return;
        }
        university = customUniversity;
      } else if (selectedUniversity) {
        university = selectedUniversity;
      } else {
        alert("Please select or enter your university");
        return;
      }
    }

    setLoading(true);
    try {
      await api.updateMe({
        university,
        track: selectedTrack as "law_school_track" | "undergraduate_track"
      });
      updateUser({
        university,
        track: selectedTrack
      });
      onComplete();
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: "var(--cyber-surface)", border: "1px solid var(--cyber-border)" }}>
        {step === "track" ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black mb-2">Welcome to Legal Ninja! 🥷</h2>
              <p style={{ color: "var(--text-muted)" }}>Which track are you following?</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleTrackSelect("law_school_track")}
                className="w-full p-4 rounded-xl border-2 transition font-bold text-left"
                style={{
                  borderColor: "var(--cyber-purple)",
                  color: "var(--cyber-purple)",
                  background: "rgba(192, 38, 211, 0.05)",
                }}
              >
                <div className="text-lg mb-1">⚖️ Law School</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Bar Finals · LPA · BL</div>
              </button>
              <button
                onClick={() => handleTrackSelect("undergraduate_track")}
                className="w-full p-4 rounded-xl border-2 transition font-bold text-left"
                style={{
                  borderColor: "var(--cyber-cyan)",
                  color: "var(--cyber-cyan)",
                  background: "rgba(0, 245, 255, 0.05)",
                }}
              >
                <div className="text-lg mb-1">🎓 Undergraduate</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>University Law Programs</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black mb-2">
                {selectedTrack === "law_school_track" ? "Which campus?" : "Which university?"}
              </h2>
              <p style={{ color: "var(--text-muted)" }}>
                {selectedTrack === "law_school_track"
                  ? "Select your Nigerian Law School campus"
                  : "Select or enter your university"}
              </p>
            </div>

            {selectedTrack === "law_school_track" ? (
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="w-full p-3 rounded-lg border text-base font-semibold"
                style={{
                  borderColor: "var(--cyber-border)",
                  background: "var(--cyber-bg)",
                  color: "var(--text-base)",
                }}
              >
                <option value="">Select a campus...</option>
                {universities.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full p-3 rounded-lg border text-base font-semibold"
                  style={{
                    borderColor: "var(--cyber-border)",
                    background: "var(--cyber-bg)",
                    color: "var(--text-base)",
                  }}
                >
                  <option value="">Select your university...</option>
                  {universities.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
                {selectedUniversity === "Other" && (
                  <input
                    type="text"
                    placeholder="Enter your university name"
                    value={customUniversity}
                    onChange={(e) => setCustomUniversity(e.target.value)}
                    className="w-full p-3 rounded-lg border text-base font-semibold"
                    style={{
                      borderColor: "var(--cyber-border)",
                      background: "var(--cyber-bg)",
                      color: "var(--text-base)",
                    }}
                    onKeyPress={(e) => e.key === "Enter" && handleUniversitySubmit()}
                  />
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep("track");
                  setSelectedTrack("");
                  setSelectedUniversity("");
                  setCustomUniversity("");
                }}
                disabled={loading}
                className="flex-1 p-3 rounded-lg border font-bold transition"
                style={{
                  borderColor: "var(--cyber-border)",
                  color: "var(--text-muted)",
                }}
              >
                Back
              </button>
              <NeonButton
                variant="cyan"
                fullWidth
                onClick={handleUniversitySubmit}
                disabled={loading}
              >
                {loading ? "Saving..." : "Continue"}
              </NeonButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

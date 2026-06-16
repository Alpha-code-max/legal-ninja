"use client";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Root-level error boundary: replaces the entire layout when the root layout
// itself throws, so it must render <html>/<body> and cannot rely on globals.css.
// Styles are inlined to match the Legal Ninja cyber palette.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050a0f",
          color: "#e2eaf0",
          fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "380px",
            width: "100%",
            textAlign: "center",
            background: "rgba(13, 27, 42, 0.75)",
            border: "1px solid rgba(255, 45, 85, 0.4)",
            borderRadius: "12px",
            padding: "32px",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 16px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              background: "rgba(255, 45, 85, 0.12)",
              border: "1px solid rgba(255, 45, 85, 0.35)",
            }}
          >
            ⚠️
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#ff2d55", margin: "0 0 8px" }}>
            System Crash
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(226, 234, 240, 0.55)", margin: "0 0 24px" }}>
            A critical error occurred and our team has been notified. Reload to get back into the dojo.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "12px 28px",
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              background: "transparent",
              color: "#ff2d55",
              border: "1px solid #ff2d55",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 0 15px rgba(255, 45, 85, 0.3)",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}

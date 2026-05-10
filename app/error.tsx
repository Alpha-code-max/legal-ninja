"use client";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

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
    <html>
      <body style={{ fontFamily: "sans-serif", padding: "40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>Something went wrong</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          An unexpected error occurred. Our team has been notified.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}

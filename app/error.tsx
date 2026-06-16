"use client";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { ErrorState } from "@/components/ui/states";

export default function Error({
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
    <ErrorState
      fullScreen
      title="Something glitched"
      description="An unexpected error occurred and our team has been notified. Try again — your progress is safe."
      onRetry={reset}
    />
  );
}

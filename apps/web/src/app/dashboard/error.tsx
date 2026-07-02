"use client";

import { ErrorFallback } from "@/components/ui/error-fallback";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      title="Dashboard Error"
      message={error.message ?? "Failed to load dashboard. Please try again."}
      onRetry={reset}
    />
  );
}

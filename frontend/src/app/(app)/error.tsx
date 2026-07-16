"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isConfigError = error.message.includes("Supabase is not configured");

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-7" aria-hidden />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">
          {isConfigError ? "Setup needed" : "Something went wrong"}
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {isConfigError
            ? "Supabase keys are missing. Copy frontend/.env.example to frontend/.env.local and fill in your project keys, then restart the dev server."
            : "We hit an unexpected problem loading this page. Your progress is safe."}
        </p>
      </div>
      {!isConfigError && (
        <Button onClick={reset} variant="outline">
          <RotateCcw aria-hidden /> Try again
        </Button>
      )}
    </div>
  );
}

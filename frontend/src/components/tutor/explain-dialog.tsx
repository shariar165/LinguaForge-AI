"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApiError, apiPost } from "@/lib/api";
import type { ExplainKind, ExplainResponse } from "@/lib/types";

/**
 * "Explain with AI" — fetches a short tutor explanation for a word, grammar
 * point, or sentence. Pass `onUseAsDefinition` to offer saving the result
 * (used by the Word Bank to fill empty definitions).
 */
export function ExplainDialog({
  text,
  kind = "word",
  trigger,
  triggerContent,
  onUseAsDefinition,
}: {
  text: string;
  kind?: ExplainKind;
  /** Button element (without children) used as the dialog trigger. */
  trigger?: React.ReactElement;
  /** Content rendered inside the trigger button. */
  triggerContent?: React.ReactNode;
  onUseAsDefinition?: (explanation: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const result = await apiPost<ExplainResponse>("/api/tutor/explain", { text, kind });
      setExplanation(result.explanation);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not get an explanation.";
      if (err instanceof ApiError && err.code === "daily_limit_reached") {
        toast.info(message);
      } else {
        toast.error(message);
      }
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next && !explanation && !loading) void load();
  }

  async function useAsDefinition() {
    if (!explanation || !onUseAsDefinition) return;
    setSaving(true);
    try {
      await onUseAsDefinition(explanation);
      toast.success("Saved as the word's definition.");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the definition.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={trigger ?? <Button variant="ghost" size="icon-sm" aria-label={`Explain "${text}" with AI`} />}
      >
        {triggerContent ?? <Sparkles aria-hidden />}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden />
            {text}
          </DialogTitle>
          <DialogDescription>Explained by your AI tutor</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8" role="status" aria-label="Loading explanation">
            <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
          </div>
        ) : explanation ? (
          <div className="prose-sm max-h-72 overflow-y-auto [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
            <Markdown>{explanation}</Markdown>
          </div>
        ) : null}
        {onUseAsDefinition && explanation && !loading && (
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={useAsDefinition} disabled={saving}>
              {saving && <Loader2 className="animate-spin" aria-hidden />}
              Save as definition
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

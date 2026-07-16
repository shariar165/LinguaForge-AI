"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { QuizQuestion as QuizQuestionType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function QuizQuestion({
  question,
  index,
  total,
  onAnswered,
}: {
  question: QuizQuestionType;
  index: number;
  total: number;
  onAnswered: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const correct = selected === question.answerIndex;

  function choose(optionIndex: number) {
    if (answered) return;
    setSelected(optionIndex);
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <p className="text-xs font-medium text-muted-foreground">
          Question {index + 1} of {total}
        </p>
        <h3 className="text-lg font-medium">{question.question}</h3>
      </div>

      <div className="grid gap-2" role="group" aria-label="Answer options">
        {question.options.map((option, i) => {
          const isCorrectOption = i === question.answerIndex;
          const isSelected = i === selected;
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={answered}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                !answered && "hover:border-primary/50 hover:bg-accent",
                answered && isCorrectOption && "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                answered && isSelected && !isCorrectOption && "border-destructive bg-destructive/10 text-destructive",
                answered && !isSelected && !isCorrectOption && "opacity-50"
              )}
            >
              {option}
              {answered && isCorrectOption && <Check className="size-4.5 shrink-0" aria-hidden />}
              {answered && isSelected && !isCorrectOption && <X className="size-4.5 shrink-0" aria-hidden />}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          className={cn(
            "animate-in fade-in slide-in-from-bottom-2 rounded-lg border p-4 text-sm",
            correct
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-destructive/40 bg-destructive/5"
          )}
          role="status"
        >
          <p className="font-semibold">{correct ? "Correct! 🎉" : "Not quite."}</p>
          <p className="mt-1 text-muted-foreground">{question.explanation}</p>
          <Button className="mt-3" size="sm" onClick={() => onAnswered(correct)}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}

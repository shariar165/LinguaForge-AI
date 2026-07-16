"use client";

import { Loader2, RefreshCcw, Sparkles, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { QuizQuestion } from "@/components/lesson/quiz-question";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, apiPost } from "@/lib/api";
import type { GeneratedQuiz, QuizQuestion as QuizQuestionType } from "@/lib/types";
import { cn } from "@/lib/utils";

type Phase = "setup" | "loading" | "playing" | "done";
type Level = "A1" | "A2" | "B1";

const TOPIC_IDEAS = ["Greetings", "Food & drink", "Travel", "Daily routines", "Shopping", "Weather"];
const LEVELS: { value: Level; label: string }[] = [
  { value: "A1", label: "A1 · Beginner" },
  { value: "A2", label: "A2 · Elementary" },
  { value: "B1", label: "B1 · Intermediate" },
];
const QUESTION_COUNT = 5;

export function AiQuiz() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<Level>("A1");
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  async function generate(chosenTopic?: string) {
    const finalTopic = (chosenTopic ?? topic).trim();
    if (!finalTopic || phase === "loading") return;
    setTopic(finalTopic);
    setPhase("loading");
    try {
      const quiz = await apiPost<GeneratedQuiz>("/api/quiz/generate", {
        topic: finalTopic,
        level,
        count: QUESTION_COUNT,
      });
      setQuestions(
        quiz.questions.map((q) => ({
          question: q.question,
          options: q.options,
          answerIndex: q.answer_index,
          explanation: q.explanation,
        }))
      );
      setIndex(0);
      setCorrectCount(0);
      setPhase("playing");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not create a quiz. Please try again.";
      if (err instanceof ApiError && err.code === "daily_limit_reached") {
        toast.info(message);
      } else {
        toast.error(message);
      }
      setPhase("setup");
    }
  }

  function reset() {
    setPhase("setup");
    setQuestions([]);
  }

  if (phase === "done") {
    const score = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="mx-auto grid w-full max-w-md gap-6 py-10 text-center">
        <div className="grid animate-in zoom-in-75 gap-4 duration-500">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Trophy className="size-10" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold">Quiz complete!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              &ldquo;{topic}&rdquo; · level {level}
            </p>
          </div>
        </div>
        <Card className="py-4">
          <CardContent className="px-4">
            <p
              className={cn(
                "text-3xl font-semibold",
                score >= 80
                  ? "text-emerald-600 dark:text-emerald-400"
                  : score >= 50
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-destructive"
              )}
            >
              {score}%
            </p>
            <p className="text-xs text-muted-foreground">
              {correctCount} of {questions.length} correct
            </p>
          </CardContent>
        </Card>
        <div className="grid gap-2">
          <Button size="lg" onClick={() => generate()}>
            <RefreshCcw aria-hidden /> Same topic, new questions
          </Button>
          <Button variant="outline" onClick={reset}>
            Pick another topic
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "playing") {
    return (
      <div className="mx-auto grid w-full max-w-2xl gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Practice Quiz</h1>
          <p className="text-sm text-muted-foreground">
            &ldquo;{topic}&rdquo; · level {level}
          </p>
        </div>
        <Card>
          <CardContent className="px-5 py-2">
            <QuizQuestion
              key={index}
              question={questions[index]}
              index={index}
              total={questions.length}
              onAnswered={(correct) => {
                if (correct) setCorrectCount((c) => c + 1);
                if (index + 1 < questions.length) {
                  setIndex(index + 1);
                } else {
                  setPhase("done");
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Practice Quiz</h1>
        <p className="text-sm text-muted-foreground">
          Pick any topic and your AI tutor will write a fresh quiz for your level.
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-5 px-5 py-2">
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void generate();
            }}
          >
            <div className="grid gap-1.5">
              <label htmlFor="quiz-topic" className="text-sm font-medium">
                What do you want to practice?
              </label>
              <Input
                id="quiz-topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="e.g. ordering food at a restaurant"
                maxLength={200}
                disabled={phase === "loading"}
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TOPIC_IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  disabled={phase === "loading"}
                  onClick={() => void generate(idea)}
                  className="rounded-full border px-3 py-1 text-sm transition-colors hover:border-primary/50 hover:bg-accent disabled:opacity-50"
                >
                  {idea}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium" id="quiz-level-label">
                  Level
                </label>
                <Select value={level} onValueChange={(v) => v && setLevel(v as Level)}>
                  <SelectTrigger className="w-44" aria-labelledby="quiz-level-label">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" size="lg" disabled={!topic.trim() || phase === "loading"}>
                {phase === "loading" ? (
                  <Loader2 className="animate-spin" aria-hidden />
                ) : (
                  <Sparkles aria-hidden />
                )}
                {phase === "loading" ? "Writing your quiz..." : "Start quiz"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {phase === "loading" && (
        <p className="text-center text-xs text-muted-foreground" role="status">
          Your tutor is writing {QUESTION_COUNT} questions about &ldquo;{topic}&rdquo;...
        </p>
      )}
    </div>
  );
}

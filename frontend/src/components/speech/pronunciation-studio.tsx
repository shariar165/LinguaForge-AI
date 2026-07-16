"use client";

import {
  Ear,
  Info,
  Loader2,
  Mic,
  RefreshCcw,
  Square,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiPost } from "@/lib/api";
import {
  listenOnce,
  speak,
  stopSpeaking,
  supportsRecognition,
  supportsTTS,
  type Accent,
  type RecognitionSession,
  type SpeechRate,
} from "@/lib/speech";
import type { PronunciationScore } from "@/lib/types";
import { useClientValue } from "@/lib/use-client-value";
import { cn } from "@/lib/utils";

export type PracticeItem = {
  kind: "word" | "sentence";
  text: string;
  ipa?: string;
  syllables?: string;
  source: string;
};

type Mode = "words" | "sentences" | "custom";

const RATES: { value: SpeechRate; label: string; hint: string }[] = [
  { value: 0.5, label: "🐢 Slow", hint: "Half speed" },
  { value: 1, label: "🚶 Normal", hint: "Natural speed" },
  { value: 1.5, label: "⚡ Fast", hint: "Fast speed" },
];

export function PronunciationStudio({ items }: { items: PracticeItem[] }) {
  const [mode, setMode] = useState<Mode>("words");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customText, setCustomText] = useState("");
  const [accent, setAccent] = useState<Accent>("en-US");
  const [rate, setRate] = useState<SpeechRate>(1);
  const [recording, setRecording] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState<PronunciationScore | null>(null);
  const [transcript, setTranscript] = useState("");
  const canRecord = useClientValue(supportsRecognition, true);
  const canPlay = useClientValue(supportsTTS, true);
  const sessionRef = useRef<RecognitionSession | null>(null);

  useEffect(() => {
    return () => {
      sessionRef.current?.abort();
      stopSpeaking();
    };
  }, []);

  const words = useMemo(() => items.filter((i) => i.kind === "word"), [items]);
  const sentences = useMemo(() => items.filter((i) => i.kind === "sentence"), [items]);

  const pool = mode === "words" ? words : mode === "sentences" ? sentences : [];
  // selectedIndex can point past the end after the pool changes; clamp once and
  // use the same index for both the current item and the chip highlight.
  const activeIndex = pool[selectedIndex] ? selectedIndex : 0;
  const current: PracticeItem | null =
    mode === "custom"
      ? customText.trim()
        ? { kind: "sentence", text: customText.trim(), source: "Your text" }
        : null
      : (pool[activeIndex] ?? null);

  function resetResult() {
    setResult(null);
    setTranscript("");
  }

  function selectItem(index: number) {
    setSelectedIndex(index);
    resetResult();
  }

  async function play(customRate?: SpeechRate) {
    if (!current) return;
    try {
      await speak(current.text, { accent, rate: customRate ?? rate });
    } catch {
      toast.error("Could not play audio on this device.");
    }
  }

  async function scoreTranscript(heard: string) {
    if (!current) return;
    setScoring(true);
    try {
      const score = await apiPost<PronunciationScore>("/api/pronunciation/score", {
        target_text: current.text,
        transcript: heard,
      });
      setResult(score);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not score your recording.");
    } finally {
      setScoring(false);
    }
  }

  function record() {
    if (!current || recording) return;
    resetResult();
    stopSpeaking();
    setRecording(true);

    sessionRef.current = listenOnce({
      onResult: (heard) => {
        setRecording(false);
        setTranscript(heard);
        void scoreTranscript(heard);
      },
      onError: (message) => {
        setRecording(false);
        toast.error(message);
      },
      onEnd: () => setRecording(false),
    });
  }

  function stopRecording() {
    sessionRef.current?.stop();
    setRecording(false);
  }

  const scoreColor =
    result === null
      ? ""
      : result.score >= 80
        ? "text-emerald-600 dark:text-emerald-400"
        : result.score >= 50
          ? "text-amber-600 dark:text-amber-400"
          : "text-destructive";

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pronunciation Studio</h1>
        <p className="text-sm text-muted-foreground">
          Listen to a native voice, record yourself, and get an instant score.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={mode} onValueChange={(v) => { setMode(v as Mode); setSelectedIndex(0); resetResult(); }}>
          <TabsList>
            <TabsTrigger value="words">Words</TabsTrigger>
            <TabsTrigger value="sentences">Sentences</TabsTrigger>
            <TabsTrigger value="custom">My text</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="ml-auto">
          <Select value={accent} onValueChange={(v) => v && setAccent(v as Accent)}>
            <SelectTrigger className="w-40" aria-label="Accent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">🇺🇸 American</SelectItem>
              <SelectItem value="en-GB">🇬🇧 British</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {mode !== "custom" && pool.length > 0 && (
        <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto rounded-lg border p-3">
          {pool.map((item, i) => (
            <button
              key={`${item.text}-${i}`}
              type="button"
              onClick={() => selectItem(i)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                i === activeIndex
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:border-primary/50 hover:bg-accent"
              )}
            >
              {item.text}
            </button>
          ))}
        </div>
      )}

      {mode !== "custom" && pool.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No practice content yet. Seed the course first (<code>npm run seed</code>) or use the
            &ldquo;My text&rdquo; tab.
          </CardContent>
        </Card>
      )}

      {mode === "custom" && (
        <Textarea
          value={customText}
          onChange={(event) => {
            setCustomText(event.target.value);
            resetResult();
          }}
          placeholder="Type any English word or sentence you want to practice..."
          maxLength={200}
          rows={2}
        />
      )}

      {current && (
        <Card>
          <CardContent className="grid gap-5 px-5 py-2">
            <div className="grid gap-1 text-center">
              <p className="text-2xl font-semibold leading-snug">{current.text}</p>
              {(current.ipa || current.syllables) && (
                <p className="text-sm text-muted-foreground">
                  {current.syllables && <span>{current.syllables}</span>}
                  {current.ipa && <span className="ml-2 font-mono">{current.ipa}</span>}
                </p>
              )}
              <p className="text-xs text-muted-foreground">From: {current.source}</p>
            </div>

            {canPlay ? (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button onClick={() => play()} size="lg">
                  <Volume2 aria-hidden /> Listen
                </Button>
                {RATES.map((r) => (
                  <Button
                    key={r.value}
                    variant={rate === r.value ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      setRate(r.value);
                      void play(r.value);
                    }}
                    title={r.hint}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Info className="size-4" aria-hidden />
                Audio playback isn&apos;t supported in this browser.
              </p>
            )}

            <div className="grid justify-items-center gap-3 border-t pt-5">
              {canRecord ? (
                <>
                  {recording ? (
                    <Button size="lg" variant="destructive" onClick={stopRecording} className="rounded-full">
                      <Square aria-hidden /> Stop recording
                    </Button>
                  ) : (
                    <Button size="lg" onClick={record} disabled={scoring} className="rounded-full">
                      {scoring ? (
                        <Loader2 className="animate-spin" aria-hidden />
                      ) : (
                        <Mic aria-hidden />
                      )}
                      {scoring ? "Scoring..." : "My turn — record"}
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground" aria-live="polite">
                    {recording
                      ? "Listening... say the text above clearly."
                      : "Tap record, then say the text out loud."}
                  </p>
                </>
              ) : (
                <div className="flex max-w-sm items-start gap-2 rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground">
                  <Ear className="mt-0.5 size-4 shrink-0" aria-hidden />
                  Recording with instant scoring needs Chrome or Edge. You can still practice by
                  listening and repeating out loud.
                </div>
              )}
            </div>

            {result && (
              <div className="grid animate-in fade-in slide-in-from-bottom-2 gap-4 border-t pt-5 duration-300">
                <div className="text-center">
                  <p className={cn("text-5xl font-bold tabular-nums", scoreColor)}>{result.score}</p>
                  <p className="text-xs text-muted-foreground">out of 100</p>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5" aria-label="Word-by-word results">
                  {result.words.map((word, i) => (
                    <Badge
                      key={`${word.word}-${i}`}
                      variant="secondary"
                      title={word.heard ? `We heard: "${word.heard}"` : "Not heard"}
                      className={cn(
                        word.matched
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {word.word}
                    </Badge>
                  ))}
                </div>
                {transcript && (
                  <p className="text-center text-xs text-muted-foreground">
                    We heard: &ldquo;{transcript}&rdquo;
                  </p>
                )}
                {result.tips.length > 0 && (
                  <ul className="grid gap-1.5 rounded-lg bg-muted/60 p-3 text-sm">
                    {result.tips.map((tip) => (
                      <li key={tip} className="flex gap-2">
                        <span aria-hidden>💡</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
                <Button variant="outline" onClick={record} className="justify-self-center">
                  <RefreshCcw aria-hidden /> Try again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

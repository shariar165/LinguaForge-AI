"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Ear,
  GraduationCap,
  Loader2,
  PartyPopper,
  Sparkles,
  Star,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { QuizQuestion } from "@/components/lesson/quiz-question";
import { AudioButton } from "@/components/speech/audio-button";
import { ExplainDialog } from "@/components/tutor/explain-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { completeLesson, saveWord, syncAchievements } from "@/lib/actions";
import { speak, stopSpeaking, supportsTTS } from "@/lib/speech";
import type { Lesson } from "@/lib/types";
import { cn } from "@/lib/utils";

type Step = "vocabulary" | "grammar" | "listening" | "quiz" | "review" | "done";
const STEPS: Exclude<Step, "done">[] = ["vocabulary", "grammar", "listening", "quiz", "review"];

const STEP_META: Record<Exclude<Step, "done">, { label: string; icon: typeof BookOpen }> = {
  vocabulary: { label: "Vocabulary", icon: BookOpen },
  grammar: { label: "Grammar", icon: GraduationCap },
  listening: { label: "Listening", icon: Ear },
  quiz: { label: "Quiz", icon: Star },
  review: { label: "Review", icon: BookmarkCheck },
};

export function LessonPlayer({ lesson, nextLessonId }: { lesson: Lesson; nextLessonId: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("vocabulary");
  const [quizIndex, setQuizIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [listeningIndex, setListeningIndex] = useState(-1); // -1 = still listening to audio
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [finishing, setFinishing] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const stepIndex = step === "done" ? STEPS.length : STEPS.indexOf(step);
  const progress = Math.round((stepIndex / STEPS.length) * 100);
  const { content } = lesson;
  const tts = useMemo(() => supportsTTS(), []);

  function goNext() {
    stopSpeaking();
    const next = STEPS[STEPS.indexOf(step as Exclude<Step, "done">) + 1];
    if (next) setStep(next);
  }

  async function onSaveWord(word: string, definition: string, example: string) {
    try {
      const added = await saveWord(word, definition, example);
      setSavedWords((prev) => new Set(prev).add(word));
      toast.success(added ? `"${word}" saved to your Word Bank` : `"${word}" is already in your Word Bank`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the word.");
    }
  }

  async function finish() {
    setFinishing(true);
    const score = Math.round((correctCount / content.quiz.length) * 100);
    try {
      await completeLesson(lesson.id, score);
      setFinalScore(score);
      setStep("done");
      const earned = await syncAchievements();
      for (const title of earned) {
        toast.success(`Achievement unlocked: ${title} 🏆`);
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your progress.");
    } finally {
      setFinishing(false);
    }
  }

  if (step === "done") {
    return (
      <div className="mx-auto grid max-w-md gap-6 py-10 text-center">
        <div className="grid animate-in zoom-in-75 gap-4 duration-500">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PartyPopper className="size-10" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold">Lesson complete!</h1>
            <p className="mt-1 text-sm text-muted-foreground">{lesson.title}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card className="py-4">
            <CardContent className="px-4">
              <p className="text-2xl font-semibold text-primary">+{lesson.xp_reward}</p>
              <p className="text-xs text-muted-foreground">XP earned</p>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent className="px-4">
              <p className="text-2xl font-semibold">{finalScore}%</p>
              <p className="text-xs text-muted-foreground">Quiz score</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-2">
          {nextLessonId && (
            <Button size="lg" render={<Link href={`/lessons/${nextLessonId}`} />}>
              Next lesson <ArrowRight aria-hidden />
            </Button>
          )}
          <Button variant="outline" render={<Link href="/lessons" />}>
            Back to course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6">
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" render={<Link href="/lessons" />}>
            <ArrowLeft aria-hidden /> Exit
          </Button>
          <Badge variant="secondary">
            Unit {lesson.unit} · {lesson.level}
          </Badge>
        </div>
        <div className="grid gap-1.5">
          <h1 className="text-xl font-semibold tracking-tight">{lesson.title}</h1>
          <Progress value={progress} aria-label="Lesson progress" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STEPS.map((s) => {
            const Icon = STEP_META[s].icon;
            const active = s === step;
            const passed = STEPS.indexOf(s) < stepIndex;
            return (
              <span
                key={s}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                  active && "bg-primary text-primary-foreground",
                  passed && "bg-primary/10 text-primary",
                  !active && !passed && "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {STEP_META[s].label}
              </span>
            );
          })}
        </div>
      </div>

      {step === "vocabulary" && (
        <div className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            New words for this lesson. Tap <Volume2 className="inline size-3.5" aria-hidden /> to hear
            them, and bookmark the hard ones.
          </p>
          <div className="grid gap-3">
            {content.vocabulary.map((item) => (
              <Card key={item.word} className="py-4">
                <CardContent className="grid gap-2 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-lg font-semibold">{item.word}</span>
                      <span className="font-mono text-xs text-muted-foreground">{item.ipa}</span>
                      <span className="text-xs text-muted-foreground">{item.syllables}</span>
                    </div>
                    <div className="flex shrink-0 items-center">
                      <AudioButton text={item.word} />
                      <ExplainDialog text={item.word} kind="word" />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={
                          savedWords.has(item.word)
                            ? `"${item.word}" saved`
                            : `Save "${item.word}" to Word Bank`
                        }
                        onClick={() => onSaveWord(item.word, item.definition, item.example)}
                        className={cn(savedWords.has(item.word) && "text-primary")}
                      >
                        {savedWords.has(item.word) ? (
                          <BookmarkCheck aria-hidden />
                        ) : (
                          <Bookmark aria-hidden />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm">{item.definition}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="italic">&ldquo;{item.example}&rdquo;</span>
                    <AudioButton text={item.example} size="icon-xs" />
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button onClick={goNext} size="lg" className="justify-self-end">
            Continue <ArrowRight aria-hidden />
          </Button>
        </div>
      )}

      {step === "grammar" && (
        <div className="grid gap-4">
          <Card>
            <CardContent className="grid gap-4 px-5 py-2">
              <div className="grid gap-1">
                <h2 className="text-lg font-semibold">{content.grammar.title}</h2>
                <p className="text-sm text-muted-foreground">{content.grammar.explanation}</p>
              </div>
              <div className="grid gap-2">
                {content.grammar.examples.map((example, i) => (
                  <div key={i} className="rounded-lg border-l-4 border-primary/60 bg-muted/50 px-4 py-3">
                    <p className="flex items-center gap-1 text-sm font-medium">
                      {example.text}
                      <AudioButton text={example.text} size="icon-xs" />
                    </p>
                    {example.note && <p className="mt-1 text-xs text-muted-foreground">{example.note}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between gap-3">
            <ExplainDialog
              text={content.grammar.title}
              kind="grammar"
              trigger={<Button variant="outline" size="sm" />}
              triggerContent={
                <>
                  <Sparkles aria-hidden /> Ask AI for more
                </>
              }
            />
            <Button onClick={goNext} size="lg">
              Continue <ArrowRight aria-hidden />
            </Button>
          </div>
        </div>
      )}

      {step === "listening" && (
        <div className="grid gap-4">
          {listeningIndex === -1 ? (
            <Card>
              <CardContent className="grid gap-4 px-5 py-2 text-center">
                <h2 className="text-lg font-semibold">{content.listening.title}</h2>
                {tts ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Listen carefully — then answer {content.listening.questions.length} questions about
                      what you heard.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        size="lg"
                        onClick={() => speak(content.listening.text).catch(() => toast.error("Could not play audio."))}
                      >
                        <Volume2 aria-hidden /> Play audio
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          speak(content.listening.text, { rate: 0.5 }).catch(() =>
                            toast.error("Could not play audio.")
                          )
                        }
                      >
                        🐢 Slow speed
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Your browser can&apos;t play audio, so read the text instead:
                    </p>
                    <p className="rounded-lg bg-muted p-4 text-left text-sm">{content.listening.text}</p>
                  </>
                )}
                <Button
                  variant="secondary"
                  onClick={() => {
                    stopSpeaking();
                    setListeningIndex(0);
                  }}
                >
                  I&apos;m ready for the questions <ArrowRight aria-hidden />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="px-5 py-2">
                <QuizQuestion
                  key={listeningIndex}
                  question={content.listening.questions[listeningIndex]}
                  index={listeningIndex}
                  total={content.listening.questions.length}
                  onAnswered={() => {
                    if (listeningIndex + 1 < content.listening.questions.length) {
                      setListeningIndex(listeningIndex + 1);
                    } else {
                      goNext();
                    }
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {step === "quiz" && (
        <Card>
          <CardContent className="px-5 py-2">
            <QuizQuestion
              key={quizIndex}
              question={content.quiz[quizIndex]}
              index={quizIndex}
              total={content.quiz.length}
              onAnswered={(correct) => {
                if (correct) setCorrectCount((c) => c + 1);
                if (quizIndex + 1 < content.quiz.length) {
                  setQuizIndex(quizIndex + 1);
                } else {
                  goNext();
                }
              }}
            />
          </CardContent>
        </Card>
      )}

      {step === "review" && (
        <div className="grid gap-4">
          <Card>
            <CardContent className="grid gap-4 px-5 py-2">
              <div>
                <h2 className="text-lg font-semibold">Quick review</h2>
                <p className="text-sm text-muted-foreground">
                  You got {correctCount} of {content.quiz.length} quiz questions right.
                </p>
              </div>
              <div className="grid gap-1.5">
                <h3 className="text-sm font-medium">Words you learned</h3>
                <div className="flex flex-wrap gap-1.5">
                  {content.vocabulary.map((item) => (
                    <Badge key={item.word} variant="secondary">
                      {item.word}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid gap-1.5">
                <h3 className="text-sm font-medium">Grammar</h3>
                <p className="text-sm text-muted-foreground">{content.grammar.title}</p>
              </div>
              <div className="grid gap-1.5">
                <h3 className="text-sm font-medium">Say it out loud</h3>
                <p className="text-xs text-muted-foreground">
                  Practice these in the Pronunciation Studio after the lesson:
                </p>
                {content.speaking.sentences.map((sentence) => (
                  <p key={sentence} className="flex items-center gap-1 text-sm">
                    &ldquo;{sentence}&rdquo; <AudioButton text={sentence} size="icon-xs" />
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
          <Button onClick={finish} size="lg" disabled={finishing} className="justify-self-end">
            {finishing && <Loader2 className="animate-spin" aria-hidden />}
            Finish lesson · +{lesson.xp_reward} XP
          </Button>
        </div>
      )}
    </div>
  );
}

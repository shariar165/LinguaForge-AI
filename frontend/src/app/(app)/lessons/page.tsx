import { Check, Lock, Play, Star } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getLessonSummaries, getProgress } from "@/lib/data";
import type { LessonSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata = { title: "Lessons" };

export default async function LessonsPage() {
  const [lessons, progress] = await Promise.all([getLessonSummaries(), getProgress()]);
  const completed = new Set(progress.filter((p) => p.status === "completed").map((p) => p.lesson_id));
  const scores = new Map(progress.map((p) => [p.lesson_id, p.quiz_score]));

  const units = new Map<number, { title: string; level: string; lessons: LessonSummary[] }>();
  for (const lesson of lessons) {
    const unit = units.get(lesson.unit) ?? { title: lesson.unit_title, level: lesson.level, lessons: [] };
    unit.lessons.push(lesson);
    units.set(lesson.unit, unit);
  }

  // A lesson unlocks when every earlier lesson (course order) is completed.
  let previousDone = true;
  const unlockState = new Map<string, boolean>();
  for (const lesson of lessons) {
    unlockState.set(lesson.id, previousDone || completed.has(lesson.id));
    previousDone = previousDone && completed.has(lesson.id);
  }

  if (lessons.length === 0) {
    return (
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Lessons</h1>
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No course content yet. Run <code className="rounded bg-muted px-1.5 py-0.5">npm run seed</code>{" "}
            in the frontend folder to load the English course.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">English course</h1>
        <p className="text-sm text-muted-foreground">
          {completed.size} of {lessons.length} lessons completed
        </p>
      </div>

      {[...units.entries()].map(([unitNumber, unit]) => (
        <section key={unitNumber} className="grid gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              Unit {unitNumber}: {unit.title}
            </h2>
            <Badge variant="secondary">{unit.level}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unit.lessons.map((lesson) => {
              const done = completed.has(lesson.id);
              const unlocked = unlockState.get(lesson.id) ?? false;
              const score = scores.get(lesson.id);

              const card = (
                <Card
                  className={cn(
                    "h-full py-4 transition-all",
                    unlocked && "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
                    !unlocked && "opacity-60"
                  )}
                >
                  <CardContent className="flex h-full flex-col gap-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "flex size-9 items-center justify-center rounded-full",
                          done
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : unlocked
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {done ? (
                          <Check className="size-4.5" aria-hidden />
                        ) : unlocked ? (
                          <Play className="size-4" aria-hidden />
                        ) : (
                          <Lock className="size-4" aria-hidden />
                        )}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Star className="size-3.5 text-primary" aria-hidden />
                        {lesson.xp_reward} XP
                      </span>
                    </div>
                    <div className="grid gap-1">
                      <h3 className="font-medium leading-tight">{lesson.title}</h3>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{lesson.description}</p>
                    </div>
                    {done && typeof score === "number" && (
                      <p className="mt-auto text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Quiz score: {score}%
                      </p>
                    )}
                    {!unlocked && (
                      <p className="mt-auto text-xs text-muted-foreground">
                        Complete the previous lesson to unlock
                      </p>
                    )}
                  </CardContent>
                </Card>
              );

              return unlocked ? (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.id}`}
                  className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {card}
                </Link>
              ) : (
                <div key={lesson.id} aria-disabled>
                  {card}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

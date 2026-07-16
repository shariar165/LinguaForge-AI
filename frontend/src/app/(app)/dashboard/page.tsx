import { ArrowRight, BookOpen, Bookmark, Flame, MessageCircle, Mic, Sparkles, Star, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getLessonSummaries,
  getProfile,
  getProgress,
  getSavedWords,
  getStreak,
} from "@/lib/data";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [profile, streak, lessons, progress, savedWords] = await Promise.all([
    getProfile(),
    getStreak(),
    getLessonSummaries(),
    getProgress(),
    getSavedWords(),
  ]);

  const completedIds = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.lesson_id)
  );
  const nextLesson = lessons.find((l) => !completedIds.has(l.id));
  const completedCount = completedIds.size;
  const courseProgress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const stats = [
    {
      label: "Day streak",
      value: streak?.current_streak ?? 0,
      icon: Flame,
      tint: "text-orange-600 dark:text-orange-400 bg-orange-500/10",
    },
    { label: "Total XP", value: profile?.xp ?? 0, icon: Star, tint: "text-primary bg-primary/10" },
    {
      label: "Lessons done",
      value: completedCount,
      icon: BookOpen,
      tint: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    },
    {
      label: "Words saved",
      value: savedWords.length,
      icon: Bookmark,
      tint: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
    },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}, {profile?.username ?? "learner"}!
        </h1>
        <p className="text-sm text-muted-foreground">
          {streak?.current_streak
            ? `You're on a ${streak.current_streak}-day streak. Keep it going!`
            : "Complete a lesson today to start your streak."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tint }) => (
          <Card key={label} className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tint}`}>
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xl font-semibold leading-tight">{value}</p>
                <p className="truncate text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {nextLesson ? (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardDescription>
              Continue learning · Unit {nextLesson.unit}: {nextLesson.unit_title}
            </CardDescription>
            <CardTitle className="text-lg">{nextLesson.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm text-muted-foreground">{nextLesson.description}</p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-40 flex-1 items-center gap-3">
                <Progress value={courseProgress} className="max-w-56" aria-label="Course progress" />
                <span className="text-xs font-medium text-muted-foreground">
                  {courseProgress}% of course
                </span>
              </div>
              <Button render={<Link href={`/lessons/${nextLesson.id}`} />}>
                Start lesson <ArrowRight aria-hidden />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : lessons.length > 0 ? (
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              Course complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              You finished every lesson. Practice speaking or chat with your tutor to stay sharp.
            </p>
            <Button variant="outline" render={<Link href="/lessons" />}>
              Review lessons
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">No lessons yet</CardTitle>
            <CardDescription>
              The course content hasn&apos;t been added to the database. Run <code>npm run seed</code> in
              the frontend folder to load it.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-colors hover:border-primary/40">
          <Link href="/practice/speak" className="block">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Mic className="size-4.5" aria-hidden />
                </span>
                Pronunciation Studio
              </CardTitle>
              <CardDescription>
                Listen, record, and get an instant score on your pronunciation.
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
        <Card className="transition-colors hover:border-primary/40">
          <Link href="/tutor" className="block">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageCircle className="size-4.5" aria-hidden />
                </span>
                AI Tutor
              </CardTitle>
              <CardDescription>
                Ask anything about English — grammar, words, or practice conversation.
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
        <Card className="transition-colors hover:border-primary/40">
          <Link href="/practice/quiz" className="block">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Sparkles className="size-4.5" aria-hidden />
                </span>
                AI Practice Quiz
              </CardTitle>
              <CardDescription>
                Get a fresh quiz on any topic, written for your level on the spot.
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}

import {
  ArrowRight,
  BookOpen,
  Ear,
  Flame,
  GraduationCap,
  MessageCircle,
  Mic,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Personal AI tutor",
    description:
      "Chat with Lingua anytime. Get corrections, grammar explanations, and conversation practice that adapts to your level.",
  },
  {
    icon: Mic,
    title: "Pronunciation Studio",
    description:
      "Listen to native audio at three speeds, record yourself, and get an instant score with word-by-word feedback.",
  },
  {
    icon: BookOpen,
    title: "Structured lessons",
    description:
      "A real course from beginner to intermediate: vocabulary, grammar, listening, and quizzes in every lesson.",
  },
  {
    icon: Flame,
    title: "Streaks & XP",
    description:
      "Daily streaks, experience points, levels, and achievements keep you coming back — learning sticks when it's fun.",
  },
  {
    icon: Ear,
    title: "Listening practice",
    description:
      "Short, natural dialogues with comprehension questions. Slow them down until your ears catch up.",
  },
  {
    icon: GraduationCap,
    title: "Word Bank",
    description:
      "Save hard words from any lesson with one tap, then review and practice them whenever you like.",
  },
];

const STEPS = [
  { step: "1", title: "Create a free account", text: "No credit card. You're learning within a minute." },
  { step: "2", title: "Follow your course", text: "Bite-size lessons build vocabulary, grammar, and listening skills." },
  { step: "3", title: "Speak and get feedback", text: "The AI scores your pronunciation and tutors you through mistakes." },
];

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {
  const { setup } = await searchParams;
  const user = isSupabaseConfigured ? await getUser() : null;
  const ctaHref = user ? "/dashboard" : "/signup";
  const ctaLabel = user ? "Go to dashboard" : "Start learning free";

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button render={<Link href="/dashboard" />}>Dashboard</Button>
            ) : (
              <>
                <Button variant="ghost" render={<Link href="/login" />}>
                  Sign in
                </Button>
                <Button render={<Link href="/signup" />}>Get started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {setup === "supabase" && (
          <div className="border-b bg-amber-500/10">
            <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400">
              <TriangleAlert className="size-4 shrink-0" aria-hidden />
              Supabase isn&apos;t configured yet. Copy <code>frontend/.env.example</code> to{" "}
              <code>frontend/.env.local</code>, fill in your keys, and restart the dev server.
            </div>
          </div>
        )}

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,--theme(--color-primary/12%),transparent)]"
          />
          <div className="mx-auto grid max-w-6xl justify-items-center gap-6 px-4 py-20 text-center md:py-28">
            <Badge variant="secondary" className="gap-1.5">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              Your personal AI language school
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              Learn English with a tutor that <span className="text-primary">never sleeps</span>
            </h1>
            <p className="max-w-xl text-balance text-muted-foreground md:text-lg">
              Real lessons, instant pronunciation feedback, and an AI tutor that knows your strengths
              and weaknesses. Free to start — learn 10 minutes a day.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" render={<Link href={ctaHref} />}>
                {ctaLabel} <ArrowRight aria-hidden />
              </Button>
              {!user && (
                <Button size="lg" variant="outline" render={<Link href="/login" />}>
                  I have an account
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span>✓ 100% free to start</span>
              <span>✓ No credit card</span>
              <span>✓ Works on your phone</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:py-24">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Everything you need to actually speak English
              </h2>
              <p className="mt-2 text-muted-foreground">
                Not just flashcards — a complete learning system built around AI feedback.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="py-5">
                  <CardContent className="grid gap-2.5 px-5">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="font-medium">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section>
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:py-24">
            <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">
              How it works
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {STEPS.map(({ step, title, text }) => (
                <div key={step} className="grid justify-items-center gap-2 text-center">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {step}
                  </span>
                  <h3 className="font-medium">{title}</h3>
                  <p className="max-w-xs text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-gradient-to-b from-primary/5 to-transparent">
          <div className="mx-auto grid max-w-6xl justify-items-center gap-5 px-4 py-16 text-center md:py-20">
            <h2 className="max-w-xl text-2xl font-semibold tracking-tight md:text-3xl">
              Your first lesson takes 5 minutes. Start today.
            </h2>
            <Button size="lg" render={<Link href={ctaHref} />}>
              {ctaLabel} <ArrowRight aria-hidden />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground md:flex-row">
          <Logo className="opacity-80" />
          <p>© {new Date().getFullYear()} LinguaVerse AI. Learn a language, love the journey.</p>
        </div>
      </footer>
    </div>
  );
}

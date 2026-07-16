import { Flame, Star } from "lucide-react";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/app/bottom-nav";
import { Sidebar } from "@/components/app/sidebar";
import { UserMenu } from "@/components/app/user-menu";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getProfile, getStreak, getUser } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  const [profile, streak] = await Promise.all([getProfile(), getStreak()]);
  const username = profile?.username ?? "learner";

  return (
    <div className="flex min-h-dvh w-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
          <div className="md:hidden">
            <Logo href="/dashboard" />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span
              className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-sm font-semibold text-orange-600 dark:text-orange-400"
              title="Daily streak"
            >
              <Flame className="size-4" aria-hidden />
              {streak?.current_streak ?? 0}
              <span className="sr-only">day streak</span>
            </span>
            <span
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary"
              title="Total XP"
            >
              <Star className="size-4" aria-hidden />
              {profile?.xp ?? 0}
              <span className="sr-only">XP</span>
            </span>
            <ThemeToggle />
            <UserMenu username={username} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 md:px-6 md:pb-10">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

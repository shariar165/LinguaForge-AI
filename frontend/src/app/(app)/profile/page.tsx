import {
  Award,
  BookOpen,
  Bookmark,
  Flame,
  GraduationCap,
  Star,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAchievements,
  getProfile,
  getProgress,
  getSavedWords,
  getStreak,
  getUnlockedAchievementIds,
} from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Profile" };

const ICONS: Record<string, typeof Award> = {
  award: Award,
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
  flame: Flame,
  zap: Zap,
  star: Star,
  bookmark: Bookmark,
};

function levelFromXp(xp: number) {
  // Simple curve: each level needs 50 more XP than the previous one.
  let level = 1;
  let threshold = 50;
  let remaining = xp;
  while (remaining >= threshold) {
    remaining -= threshold;
    threshold += 50;
    level += 1;
  }
  return { level, progress: Math.round((remaining / threshold) * 100) };
}

export default async function ProfilePage() {
  const [profile, streak, progress, savedWords, achievements, unlockedIds] = await Promise.all([
    getProfile(),
    getStreak(),
    getProgress(),
    getSavedWords(),
    getAchievements(),
    getUnlockedAchievementIds(),
  ]);

  const unlocked = new Set(unlockedIds);
  const completedCount = progress.filter((p) => p.status === "completed").length;
  const { level, progress: levelProgress } = levelFromXp(profile?.xp ?? 0);
  const username = profile?.username ?? "learner";

  const stats = [
    { label: "Total XP", value: profile?.xp ?? 0, icon: Star },
    { label: "Current streak", value: `${streak?.current_streak ?? 0} days`, icon: Flame },
    { label: "Longest streak", value: `${streak?.longest_streak ?? 0} days`, icon: Zap },
    { label: "Lessons completed", value: completedCount, icon: BookOpen },
    { label: "Words saved", value: savedWords.length, icon: Bookmark },
  ];

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarFallback className="bg-primary/15 text-xl font-semibold text-primary">
            {(username[0] ?? "?").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">@{username}</h1>
          <p className="text-sm text-muted-foreground">
            Level {level} · {levelProgress}% to next level
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="py-4">
            <CardContent className="grid gap-1 px-4">
              <Icon className="size-4.5 text-primary" aria-hidden />
              <p className="text-lg font-semibold leading-tight">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Achievements · {unlocked.size} of {achievements.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {achievements.map((achievement) => {
            const Icon = ICONS[achievement.icon] ?? Award;
            const earned = unlocked.has(achievement.id);
            return (
              <div
                key={achievement.id}
                className={cn(
                  "grid justify-items-center gap-1.5 rounded-xl border p-4 text-center",
                  earned ? "border-primary/40 bg-primary/5" : "opacity-50"
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full",
                    earned ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="text-sm font-medium leading-tight">{achievement.title}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                {earned && <Badge variant="secondary">Unlocked</Badge>}
              </div>
            );
          })}
          {achievements.length === 0 && (
            <p className="col-span-full py-4 text-center text-sm text-muted-foreground">
              Achievements will appear once the course is seeded.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

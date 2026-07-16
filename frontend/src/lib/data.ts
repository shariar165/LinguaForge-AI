import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  Achievement,
  Lesson,
  LessonSummary,
  Profile,
  SavedWord,
  Streak,
  UserProgress,
} from "@/lib/types";

/** The signed-in user, or null. Cached per request. */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
}

export async function getStreak(): Promise<Streak | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("streaks").select("*").eq("user_id", user.id).single();
  return data;
}

export async function getLessonSummaries(): Promise<LessonSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("id, unit, unit_title, level, order, title, description, xp_reward")
    .order("unit")
    .order("order");
  if (error) throw new Error(`Could not load lessons: ${error.message}`);
  return data ?? [];
}

export async function getLesson(id: string): Promise<Lesson | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("lessons").select("*").eq("id", id).single();
  return data;
}

export async function getProgress(): Promise<UserProgress[]> {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_progress")
    .select("lesson_id, status, quiz_score, completed_at")
    .eq("user_id", user.id);
  return data ?? [];
}

export async function getSavedWords(): Promise<SavedWord[]> {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_words")
    .select("id, word, definition, example, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAchievements(): Promise<Achievement[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("achievements").select("*");
  return data ?? [];
}

export async function getUnlockedAchievementIds(): Promise<string[]> {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", user.id);
  return (data ?? []).map((row) => row.achievement_id);
}

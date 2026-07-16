"use client";

import { createClient } from "@/lib/supabase/client";
import type { SavedWord } from "@/lib/types";

/** Save a word to the user's Word Bank. Returns the saved row, or null if it was already saved. */
export async function saveWord(word: string, definition: string, example: string): Promise<SavedWord | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You need to sign in first.");

  const { data, error } = await supabase
    .from("saved_words")
    .insert({
      user_id: user.id,
      word: word.trim(),
      definition: definition.trim(),
      example: example.trim(),
    })
    .select("id, word, definition, example, created_at")
    .single();
  if (error) {
    if (error.code === "23505") return null; // already saved
    throw new Error("Could not save the word. Please try again.");
  }
  return data;
}

/** Fill in a saved word's definition (e.g. from an AI explanation). */
export async function updateWordDefinition(id: number, definition: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("saved_words").update({ definition }).eq("id", id);
  if (error) throw new Error("Could not update the word. Please try again.");
}

export async function removeWord(id: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("saved_words").delete().eq("id", id);
  if (error) throw new Error("Could not remove the word. Please try again.");
}

/** Mark a lesson complete: updates progress, XP, and streak atomically. */
export async function completeLesson(lessonId: string, quizScore: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("complete_lesson", {
    p_lesson_id: lessonId,
    p_quiz_score: quizScore,
  });
  if (error) throw new Error("Could not save your progress. Please try again.");
}

/** Check for newly earned achievements and unlock them. Returns new titles. */
export async function syncAchievements(): Promise<string[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: achievements }, { data: unlocked }, { data: profile }, { data: streakRow }, progressRes, wordsRes] =
    await Promise.all([
      supabase.from("achievements").select("*"),
      supabase.from("user_achievements").select("achievement_id").eq("user_id", user.id),
      supabase.from("profiles").select("xp").eq("id", user.id).single(),
      supabase.from("streaks").select("current_streak, longest_streak").eq("user_id", user.id).single(),
      supabase
        .from("user_progress")
        .select("lesson_id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("saved_words")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  if (!achievements) return [];
  const unlockedIds = new Set((unlocked ?? []).map((u) => u.achievement_id));

  const totals: Record<string, number> = {
    lessons_completed: progressRes.count ?? 0,
    streak_days: Math.max(streakRow?.current_streak ?? 0, streakRow?.longest_streak ?? 0),
    xp_total: profile?.xp ?? 0,
    words_saved: wordsRes.count ?? 0,
  };

  const newlyEarned = achievements.filter(
    (a) => !unlockedIds.has(a.id) && totals[a.requirement_kind] >= a.requirement_value
  );
  if (newlyEarned.length === 0) return [];

  const { error } = await supabase
    .from("user_achievements")
    .insert(newlyEarned.map((a) => ({ user_id: user.id, achievement_id: a.id })));
  if (error) return [];
  return newlyEarned.map((a) => a.title);
}

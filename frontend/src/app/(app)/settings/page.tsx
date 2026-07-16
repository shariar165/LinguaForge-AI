import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const [
    profile,
    {
      data: { user },
    },
  ] = await Promise.all([getProfile(), supabase.auth.getUser()]);

  return (
    <SettingsForm
      email={user?.email ?? ""}
      username={profile?.username ?? ""}
      dailyGoal={profile?.daily_goal_minutes ?? 10}
    />
  );
}

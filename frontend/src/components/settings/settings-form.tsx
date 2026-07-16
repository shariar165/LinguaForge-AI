"use client";

import { Loader2, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useClientValue } from "@/lib/use-client-value";
import { usernameSchema } from "@/lib/validation";

const GOALS = [5, 10, 15, 20, 30, 60];

export function SettingsForm({
  email,
  username: initialUsername,
  dailyGoal: initialGoal,
}: {
  email: string;
  username: string;
  dailyGoal: number;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const mounted = useClientValue(() => true, false);
  const [username, setUsername] = useState(initialUsername);
  const [goal, setGoal] = useState(String(initialGoal));
  const [saving, setSaving] = useState(false);

  async function save() {
    const parsed = usernameSchema.safeParse(username);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid username.");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You need to sign in again.");
      const { error } = await supabase
        .from("profiles")
        .update({ username: parsed.data, daily_goal_minutes: Number(goal) })
        .eq("id", user.id);
      if (error) {
        toast.error(
          error.code === "23505" ? "That username is taken. Try another." : "Could not save settings."
        );
        return;
      }
      toast.success("Settings saved.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Your account and learning preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>How you appear in LinguaVerse.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled aria-readonly />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={24}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="goal">Daily goal</Label>
            <Select value={goal} onValueChange={(v) => v && setGoal(v)}>
              <SelectTrigger id="goal" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOALS.map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    {g} minutes / day
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={save} disabled={saving} className="justify-self-start">
            {saving && <Loader2 className="animate-spin" aria-hidden />}
            Save changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Choose how LinguaVerse looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          {mounted && (
            <div className="flex gap-2" role="radiogroup" aria-label="Theme">
              {(
                [
                  { value: "light", label: "Light", icon: Sun },
                  { value: "dark", label: "Dark", icon: Moon },
                  { value: "system", label: "System", icon: Monitor },
                ] as const
              ).map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={theme === value ? "secondary" : "outline"}
                  onClick={() => setTheme(value)}
                  role="radio"
                  aria-checked={theme === value}
                >
                  <Icon aria-hidden /> {label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { fieldErrors, signupSchema } from "@/lib/validation";

export default function SignupPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = signupSchema.safeParse({
      username: form.get("username"),
      email: form.get("email"),
      password: form.get("password"),
    });
    setErrors(fieldErrors(parsed));
    if (!parsed.success) return;

    setPending(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { data: { username: parsed.data.username } },
      });
      if (error) {
        const message = typeof error.message === "string" ? error.message.trim() : "";
        if (error.status === 429 || /rate limit/i.test(message)) {
          toast.error(
            "Too many sign-ups this hour (free email limit). Try again later — or disable 'Confirm email' in Supabase to remove the limit."
          );
        } else {
          toast.error(message || "Could not create the account. Please try again.");
        }
        return;
      }
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.success("Check your email to confirm your account, then sign in.");
        router.push("/login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign up. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>Start learning English in under a minute.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <GoogleButton />
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              placeholder="sara_learns"
              aria-invalid={Boolean(errors.username)}
            />
            {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            Create account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Already have an account?&nbsp;
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}

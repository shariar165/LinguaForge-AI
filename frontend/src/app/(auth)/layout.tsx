import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-muted/40 p-4">
      <Logo />
      <div className="w-full max-w-sm">{children}</div>
      <p className="text-center text-xs text-muted-foreground">
        Learn English with your personal AI tutor — free.
      </p>
    </div>
  );
}

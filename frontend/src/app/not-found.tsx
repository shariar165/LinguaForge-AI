import { Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Compass className="size-7" aria-hidden />
      </span>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This page doesn&apos;t exist or has moved. Let&apos;s get you back to learning.
        </p>
      </div>
      <Button render={<Link href="/dashboard" />}>Go to dashboard</Button>
    </div>
  );
}

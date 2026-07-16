import { Languages } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-heading font-semibold", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Languages className="size-4.5" aria-hidden />
      </span>
      <span className="text-lg tracking-tight">
        LinguaVerse <span className="text-primary">AI</span>
      </span>
    </Link>
  );
}

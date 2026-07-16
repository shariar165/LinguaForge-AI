"use client";

import { Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { speak, stopSpeaking, supportsTTS, type Accent, type SpeechRate } from "@/lib/speech";
import { useClientValue } from "@/lib/use-client-value";
import { cn } from "@/lib/utils";

export function AudioButton({
  text,
  accent = "en-US",
  rate = 1,
  size = "icon-sm",
  className,
  label,
}: {
  text: string;
  accent?: Accent;
  rate?: SpeechRate;
  size?: "icon-xs" | "icon-sm" | "icon" | "icon-lg";
  className?: string;
  label?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const supported = useClientValue(supportsTTS, true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopSpeaking();
    };
  }, []);

  if (!supported) return null;

  async function play() {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    try {
      await speak(text, { accent, rate });
    } catch {
      toast.error("Could not play audio on this device.");
    } finally {
      if (mounted.current) setPlaying(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={play}
      aria-label={label ?? `Listen to "${text}"`}
      className={cn(playing && "text-primary", className)}
    >
      <Volume2 className={cn(playing && "animate-pulse")} aria-hidden />
    </Button>
  );
}

"use client";

/**
 * Browser speech helpers: text-to-speech (speechSynthesis) and speech
 * recognition (Web Speech API). Both are free and run entirely client-side.
 * Every entry point checks capability first — callers can rely on the
 * `supports*` flags to render fallbacks.
 */

export type Accent = "en-US" | "en-GB";
export type SpeechRate = 0.5 | 1 | 1.5;

export function supportsTTS(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function supportsRecognition(): boolean {
  return getRecognitionCtor() !== null;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!supportsTTS()) return Promise.resolve([]);
  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) {
    cachedVoices = existing;
    return Promise.resolve(existing);
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1500);
    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timer);
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    };
  });
}

function pickVoice(accent: Accent): SpeechSynthesisVoice | null {
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.replace("_", "-") === accent && v.localService) ??
    voices.find((v) => v.lang.replace("_", "-") === accent) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null
  );
}

/** Speak text aloud. Resolves when playback finishes or fails. */
export async function speak(
  text: string,
  options: { accent?: Accent; rate?: SpeechRate } = {}
): Promise<void> {
  if (!supportsTTS()) {
    throw new Error("Text-to-speech is not supported in this browser.");
  }
  await loadVoices();
  window.speechSynthesis.cancel();

  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(options.accent ?? "en-US");
    if (voice) utterance.voice = voice;
    utterance.lang = options.accent ?? "en-US";
    utterance.rate = options.rate ?? 1;
    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      if (event.error === "interrupted" || event.error === "canceled") resolve();
      else reject(new Error(`Speech failed: ${event.error}`));
    };
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (supportsTTS()) window.speechSynthesis.cancel();
}

export type RecognitionSession = {
  stop: () => void;
  abort: () => void;
};

/**
 * Listen once and return the transcript via callbacks.
 * Times out after `timeoutMs` if the browser never returns a result.
 */
export function listenOnce(handlers: {
  onResult: (transcript: string) => void;
  onError: (message: string) => void;
  onEnd?: () => void;
  timeoutMs?: number;
}): RecognitionSession | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    handlers.onError(
      "Speech recognition is not supported in this browser. Try Chrome or Edge for pronunciation scoring."
    );
    return null;
  }

  const recognition = new Ctor();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  let finished = false;
  const timer = setTimeout(() => {
    if (!finished) {
      finished = true;
      recognition.abort();
      handlers.onError("We didn't hear anything. Check your microphone and try again.");
    }
  }, handlers.timeoutMs ?? 12_000);

  recognition.onresult = (event) => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    const transcript = Array.from({ length: event.results.length })
      .map((_, i) => event.results[i][0]?.transcript ?? "")
      .join(" ")
      .trim();
    handlers.onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    const messages: Record<string, string> = {
      "not-allowed": "Microphone access was blocked. Allow the microphone in your browser settings.",
      "no-speech": "We didn't hear anything. Speak a little louder and try again.",
      "audio-capture": "No microphone found. Plug one in or check your sound settings.",
      network: "Speech recognition needs an internet connection. Check your network.",
    };
    handlers.onError(messages[event.error] ?? "Could not recognize speech. Please try again.");
  };

  recognition.onend = () => {
    clearTimeout(timer);
    handlers.onEnd?.();
  };

  try {
    recognition.start();
  } catch {
    clearTimeout(timer);
    handlers.onError("Could not start the microphone. Please try again.");
    return null;
  }

  return {
    stop: () => recognition.stop(),
    abort: () => {
      finished = true;
      clearTimeout(timer);
      recognition.abort();
    },
  };
}

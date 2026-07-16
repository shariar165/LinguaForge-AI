"use client";

import { CircleStop, Languages, Loader2, SendHorizonal, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiStream } from "@/lib/api";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Correct this sentence: \"She go to school yesterday.\"",
  "What is the difference between 'make' and 'do'?",
  "Give me 5 useful phrases for ordering food.",
  "Let's practice a conversation about travel.",
];

const MAX_MESSAGE_LENGTH = 4000;

export function TutorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      toast.error("That message is too long. Try something shorter.");
      return;
    }

    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const appendToLast = (updater: (content: string) => string) => {
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        copy[copy.length - 1] = { ...last, content: updater(last.content) };
        return copy;
      });
    };

    try {
      await apiStream(
        "/api/tutor/chat",
        // Send a rolling window to keep requests small
        { messages: nextMessages.slice(-12) },
        {
          onText: (text) => appendToLast((content) => content + text),
          onDone: () => setStreaming(false),
          onError: (message) => {
            appendToLast((content) => content || `⚠️ ${message}`);
            setStreaming(false);
          },
        },
        controller.signal
      );
    } catch (err) {
      setStreaming(false);
      if (controller.signal.aborted) return;
      const message =
        err instanceof ApiError ? err.message : "Could not reach the tutor. Please try again.";
      appendToLast((content) => content || `⚠️ ${message}`);
      if (err instanceof ApiError && err.code === "daily_limit_reached") {
        toast.info(err.message);
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(input);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-11.5rem)] w-full max-w-2xl flex-col md:h-[calc(100dvh-9rem)]">
      <div className="flex-1 overflow-y-auto pb-4" role="log" aria-label="Chat with AI tutor" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Languages className="size-8" aria-hidden />
            </span>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">Hi! I&apos;m Lingua, your English tutor.</h1>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                Ask me to explain grammar, correct your sentences, or just practice a conversation.
              </p>
            </div>
            <div className="grid w-full max-w-md gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/50 hover:bg-accent"
                >
                  <Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            {messages.map((message, i) => (
              <div
                key={i}
                className={cn("flex gap-3", message.role === "user" && "justify-end")}
              >
                {message.role === "assistant" && (
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Languages className="size-4" aria-hidden />
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.content ? (
                    message.role === "assistant" ? (
                      <div className="prose-sm [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
                        <Markdown>{message.content}</Markdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )
                  ) : (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Thinking" />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form
        className="flex items-end gap-2 border-t pt-3"
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
      >
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask your English tutor anything..."
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          className="max-h-32 min-h-10 flex-1 resize-none"
          aria-label="Message"
        />
        {streaming ? (
          <Button type="button" variant="outline" size="icon-lg" onClick={stop} aria-label="Stop response">
            <CircleStop aria-hidden />
          </Button>
        ) : (
          <Button type="submit" size="icon-lg" disabled={!input.trim()} aria-label="Send message">
            <SendHorizonal aria-hidden />
          </Button>
        )}
      </form>
    </div>
  );
}

"use client";

import { createClient } from "@/lib/supabase/client";
import type { ApiErrorBody } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
  }
}

async function getAccessToken(): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new ApiError("unauthorized", "You need to sign in first.", 401);
  }
  return session.access_token;
}

async function parseError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return new ApiError(body.error.code, body.error.message, response.status);
  } catch {
    return new ApiError("unknown", "Something went wrong. Please try again.", response.status);
  }
}

/** POST JSON to the FastAPI backend with auth and a timeout. */
export async function apiPost<T>(path: string, body: unknown, timeoutMs = 30_000): Promise<T> {
  const token = await getAccessToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) throw await parseError(response);
    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("timeout", "The server took too long to respond. Please try again.", 408);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError("network", "Could not reach the server. Check your connection.", 0);
  } finally {
    clearTimeout(timer);
  }
}

export type StreamHandlers = {
  onText: (text: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
};

/** Stream an SSE response from the backend (AI tutor chat). Returns an abort function. */
export async function apiStream(
  path: string,
  body: unknown,
  handlers: StreamHandlers,
  signal?: AbortSignal
): Promise<void> {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok || !response.body) {
    throw await parseError(response);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";
      for (const event of events) {
        const line = event.trim();
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") {
          handlers.onDone();
          return;
        }
        try {
          const parsed = JSON.parse(data) as { text?: string; error?: string };
          if (parsed.error) {
            handlers.onError(parsed.error);
            return;
          }
          if (parsed.text) handlers.onText(parsed.text);
        } catch {
          // Skip malformed chunks rather than crashing the stream.
        }
      }
    }
    handlers.onDone();
  } finally {
    reader.releaseLock();
  }
}

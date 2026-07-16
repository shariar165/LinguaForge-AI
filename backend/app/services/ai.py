"""LLM access through the Groq API (OpenAI-compatible)."""

import json
import logging
from collections.abc import AsyncIterator

from openai import APIError, AsyncOpenAI

from ..config import Settings
from ..errors import ApiError

logger = logging.getLogger("linguaverse")

TUTOR_SYSTEM_PROMPT = """You are Lingua, a friendly and encouraging English teacher inside the LinguaVerse AI app.
Your student is learning English (levels A1-B1). Follow these rules:
- Keep answers short, clear, and beginner-friendly. Prefer simple words.
- When correcting mistakes, show the corrected sentence, then explain the rule in one or two lines.
- Use small examples. Format lists and examples with Markdown.
- If asked something unrelated to learning English, gently steer back to English practice.
- Be warm and motivating; celebrate progress."""


def ensure_ai_configured(settings: Settings) -> None:
    """Raise 503 when no API key is set. Streaming routes must call this
    before returning a StreamingResponse — inside the generator it's too late
    for a proper HTTP error, the 200 status has already been sent."""
    if not settings.groq_api_key:
        raise ApiError(503, "ai_not_configured", "The AI service is not configured on the server.")


def _client(settings: Settings) -> AsyncOpenAI:
    ensure_ai_configured(settings)
    return AsyncOpenAI(api_key=settings.groq_api_key, base_url=settings.ai_base_url)


async def stream_chat(
    settings: Settings, messages: list[dict], system_prompt: str = TUTOR_SYSTEM_PROMPT
) -> AsyncIterator[str]:
    """Yield SSE-formatted chunks; falls back to the secondary model on provider failure."""
    client = _client(settings)
    payload = [{"role": "system", "content": system_prompt}, *messages]

    for model in (settings.ai_model, settings.ai_fallback_model):
        streamed_any = False
        try:
            stream = await client.chat.completions.create(
                model=model, messages=payload, stream=True, max_tokens=1000
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content if chunk.choices else None
                if delta:
                    streamed_any = True
                    yield f"data: {json.dumps({'text': delta})}\n\n"
            yield "data: [DONE]\n\n"
            return
        except APIError as exc:
            logger.warning("Model %s failed (%s).", model, exc)
            if streamed_any:
                # The client already received part of this answer; restarting on the
                # fallback model would duplicate it. Report the failure instead.
                break

    yield f"data: {json.dumps({'error': 'The AI tutor is temporarily unavailable. Please try again in a moment.'})}\n\n"


async def complete_json(settings: Settings, system_prompt: str, user_prompt: str) -> dict:
    """Single-shot completion that must return JSON; falls back on provider failure."""
    client = _client(settings)
    for model in (settings.ai_model, settings.ai_fallback_model):
        try:
            response = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=2000,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content or "{}"
            return json.loads(content)
        except (APIError, json.JSONDecodeError) as exc:
            logger.warning("Model %s failed for JSON completion (%s); trying fallback.", model, exc)
            continue
    raise ApiError(502, "ai_unavailable", "The AI service is temporarily unavailable. Please try again.")


async def complete_text(settings: Settings, system_prompt: str, user_prompt: str) -> str:
    client = _client(settings)
    for model in (settings.ai_model, settings.ai_fallback_model):
        try:
            response = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=800,
            )
            return response.choices[0].message.content or ""
        except APIError as exc:
            logger.warning("Model %s failed for text completion (%s); trying fallback.", model, exc)
            continue
    raise ApiError(502, "ai_unavailable", "The AI service is temporarily unavailable. Please try again.")

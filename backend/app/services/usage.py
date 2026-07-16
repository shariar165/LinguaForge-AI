"""Daily AI usage caps, tracked in the Supabase `ai_usage` table (service role)."""

import asyncio
import logging
from datetime import UTC, datetime

from postgrest.exceptions import APIError as PostgrestError
from supabase import Client, create_client

from ..config import Settings
from ..errors import ApiError

logger = logging.getLogger("linguaverse")

# PostgREST code for "function not found" — the 0002 migration hasn't been applied.
_RPC_MISSING = "PGRST202"

_client: Client | None = None
_rpc_available = True


def _get_client(settings: Settings) -> Client | None:
    global _client
    if _client is None and settings.supabase_url and settings.supabase_service_role_key:
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client


def _limit_error() -> ApiError:
    return ApiError(
        429,
        "daily_limit_reached",
        "You've reached today's free AI limit. Come back tomorrow — your streak will be waiting!",
    )


def _increment_sync(client: Client, settings: Settings, user_id: str) -> int:
    """Blocking Supabase calls — always run via asyncio.to_thread."""
    global _rpc_available
    limit = settings.daily_ai_message_limit

    if _rpc_available:
        try:
            result = client.rpc("increment_ai_usage", {"p_user_id": user_id, "p_limit": limit}).execute()
            count = result.data
            if count == -1:
                raise _limit_error()
            return limit - count
        except PostgrestError as exc:
            if exc.code != _RPC_MISSING:
                raise
            _rpc_available = False
            logger.warning(
                "increment_ai_usage RPC not found — apply supabase/migrations/0002_ai_usage_increment.sql. "
                "Falling back to a non-atomic usage cap."
            )

    # Fallback: read-then-upsert (racy under concurrent requests from the same user).
    today = datetime.now(UTC).date().isoformat()
    result = (
        client.table("ai_usage")
        .select("message_count")
        .eq("user_id", user_id)
        .eq("date", today)
        .execute()
    )
    current = result.data[0]["message_count"] if result.data else 0

    if current >= limit:
        raise _limit_error()

    client.table("ai_usage").upsert(
        {"user_id": user_id, "date": today, "message_count": current + 1},
        on_conflict="user_id,date",
    ).execute()

    return limit - (current + 1)


async def check_and_increment_usage(settings: Settings, user_id: str) -> int:
    """Raise 429 if the user is at their daily cap; otherwise record one use.

    Returns the number of messages remaining today (after this one).
    """
    client = _get_client(settings)
    if client is None:
        # Dev environment without Supabase configured: allow, but log loudly.
        logger.warning("Supabase not configured — AI usage cap is NOT being enforced.")
        return settings.daily_ai_message_limit

    return await asyncio.to_thread(_increment_sync, client, settings, user_id)

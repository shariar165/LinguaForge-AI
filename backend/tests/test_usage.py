from types import SimpleNamespace

import pytest
from postgrest.exceptions import APIError as PostgrestError

from app.config import Settings
from app.errors import ApiError
from app.services import usage


class FakeExec:
    def __init__(self, result):
        self.result = result

    def execute(self):
        if isinstance(self.result, Exception):
            raise self.result
        return SimpleNamespace(data=self.result)


class FakeTable:
    def __init__(self, client):
        self.client = client

    def select(self, *args, **kwargs):
        return self

    def eq(self, *args):
        return self

    def execute(self):
        rows = [{"message_count": self.client.current}] if self.client.current is not None else []
        return SimpleNamespace(data=rows)

    def upsert(self, payload, on_conflict=None):
        self.client.upserts.append((payload, on_conflict))
        return FakeExec([])


class FakeClient:
    def __init__(self, rpc_result=None, current=None):
        self.rpc_result = rpc_result
        self.current = current
        self.rpc_calls = []
        self.upserts = []

    def rpc(self, name, params):
        self.rpc_calls.append((name, params))
        return FakeExec(self.rpc_result)

    def table(self, name):
        return FakeTable(self)


SETTINGS = Settings(supabase_url="http://test", supabase_service_role_key="k", daily_ai_message_limit=30)
USER = "00000000-0000-0000-0000-000000000001"


@pytest.fixture(autouse=True)
def reset_usage_state(monkeypatch):
    usage._rpc_available = True
    yield


def use_client(monkeypatch, fake):
    monkeypatch.setattr(usage, "_get_client", lambda settings: fake)


async def test_rpc_increment_returns_remaining(monkeypatch):
    fake = FakeClient(rpc_result=3)
    use_client(monkeypatch, fake)
    remaining = await usage.check_and_increment_usage(SETTINGS, USER)
    assert remaining == 27
    assert fake.rpc_calls == [("increment_ai_usage", {"p_user_id": USER, "p_limit": 30})]


async def test_rpc_at_cap_raises_429(monkeypatch):
    fake = FakeClient(rpc_result=-1)
    use_client(monkeypatch, fake)
    with pytest.raises(ApiError) as exc:
        await usage.check_and_increment_usage(SETTINGS, USER)
    assert exc.value.status_code == 429
    assert exc.value.code == "daily_limit_reached"


async def test_missing_rpc_falls_back_to_upsert(monkeypatch):
    missing = PostgrestError({"message": "function not found", "code": "PGRST202", "hint": "", "details": ""})
    fake = FakeClient(rpc_result=missing, current=4)
    use_client(monkeypatch, fake)
    remaining = await usage.check_and_increment_usage(SETTINGS, USER)
    assert remaining == 25
    payload, on_conflict = fake.upserts[0]
    assert payload["message_count"] == 5
    assert on_conflict == "user_id,date"
    # the missing RPC is remembered — the next call skips it entirely
    fake.rpc_calls.clear()
    await usage.check_and_increment_usage(SETTINGS, USER)
    assert fake.rpc_calls == []


async def test_fallback_at_cap_raises_429(monkeypatch):
    usage._rpc_available = False
    fake = FakeClient(current=30)
    use_client(monkeypatch, fake)
    with pytest.raises(ApiError) as exc:
        await usage.check_and_increment_usage(SETTINGS, USER)
    assert exc.value.status_code == 429
    assert fake.upserts == []


async def test_unconfigured_supabase_allows(monkeypatch):
    use_client(monkeypatch, None)
    remaining = await usage.check_and_increment_usage(SETTINGS, USER)
    assert remaining == 30

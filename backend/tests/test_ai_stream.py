import json
from types import SimpleNamespace

import httpx
from openai import APIError

from app.config import Settings
from app.services import ai

SETTINGS = Settings(groq_api_key="test-key")


def api_error() -> APIError:
    return APIError("provider down", httpx.Request("POST", "http://test"), body=None)


def chunk(text: str):
    return SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=text))])


async def fake_stream(items):
    for item in items:
        if isinstance(item, Exception):
            raise item
        yield chunk(item)


class FakeClient:
    """chat.completions.create pops one behavior per call: an exception or a chunk list."""

    def __init__(self, behaviors):
        self.behaviors = list(behaviors)
        self.calls = 0
        self.chat = SimpleNamespace(completions=SimpleNamespace(create=self._create))

    async def _create(self, **kwargs):
        self.calls += 1
        behavior = self.behaviors.pop(0)
        if isinstance(behavior, Exception):
            raise behavior
        return fake_stream(behavior)


async def collect(gen):
    return [frame async for frame in gen]


async def test_fallback_when_primary_fails_before_first_chunk(monkeypatch):
    fake = FakeClient([api_error(), ["Hello", " there"]])
    monkeypatch.setattr(ai, "_client", lambda settings: fake)
    frames = await collect(ai.stream_chat(SETTINGS, [{"role": "user", "content": "hi"}]))
    texts = [json.loads(f.removeprefix("data: "))["text"] for f in frames[:-1]]
    assert texts == ["Hello", " there"]
    assert frames[-1] == "data: [DONE]\n\n"
    assert fake.calls == 2


async def test_no_fallback_after_partial_stream(monkeypatch):
    fake = FakeClient([["Hello", api_error()], ["should never run"]])
    monkeypatch.setattr(ai, "_client", lambda settings: fake)
    frames = await collect(ai.stream_chat(SETTINGS, [{"role": "user", "content": "hi"}]))
    assert json.loads(frames[0].removeprefix("data: ")) == {"text": "Hello"}
    # ends with an error frame, not a restarted answer from the fallback model
    assert "error" in json.loads(frames[-1].removeprefix("data: "))
    assert fake.calls == 1


async def test_error_frame_when_all_models_fail(monkeypatch):
    fake = FakeClient([api_error(), api_error()])
    monkeypatch.setattr(ai, "_client", lambda settings: fake)
    frames = await collect(ai.stream_chat(SETTINGS, [{"role": "user", "content": "hi"}]))
    assert len(frames) == 1
    assert "error" in json.loads(frames[0].removeprefix("data: "))
    assert fake.calls == 2

from datetime import UTC, datetime, timedelta

import jwt
import pytest
from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.errors import ApiError
from app.main import app
from app.routers import quiz as quiz_router
from app.routers import tutor as tutor_router

SECRET = "test-secret-for-unit-tests"


def override_settings(**kwargs):
    defaults = {"supabase_jwt_secret": SECRET, "frontend_origins": "http://localhost:3000"}
    app.dependency_overrides[get_settings] = lambda: Settings(**{**defaults, **kwargs})


@pytest.fixture(autouse=True)
def clear_overrides():
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=False)


def auth_header() -> dict:
    payload = {
        "sub": "00000000-0000-0000-0000-000000000001",
        "email": "student@example.com",
        "aud": "authenticated",
        "exp": datetime.now(UTC) + timedelta(minutes=30),
    }
    return {"Authorization": f"Bearer {jwt.encode(payload, SECRET, algorithm='HS256')}"}


async def allow_usage(settings, user_id):
    return 5


CHAT_BODY = {"messages": [{"role": "user", "content": "Hello!"}]}
QUIZ_BODY = {"topic": "greetings", "level": "A1", "count": 2}


def test_chat_returns_503_when_ai_not_configured(client):
    override_settings(groq_api_key="")
    response = client.post("/api/tutor/chat", json=CHAT_BODY, headers=auth_header())
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "ai_not_configured"


def test_explain_returns_503_when_ai_not_configured(client):
    override_settings(groq_api_key="")
    response = client.post("/api/tutor/explain", json={"text": "hello"}, headers=auth_header())
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "ai_not_configured"


def test_quiz_returns_503_when_ai_not_configured(client):
    override_settings(groq_api_key="")
    response = client.post("/api/quiz/generate", json=QUIZ_BODY, headers=auth_header())
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "ai_not_configured"


def test_chat_returns_429_at_daily_limit(client, monkeypatch):
    override_settings(groq_api_key="test-key")

    async def deny_usage(settings, user_id):
        raise ApiError(429, "daily_limit_reached", "Limit reached.")

    monkeypatch.setattr(tutor_router, "check_and_increment_usage", deny_usage)
    response = client.post("/api/tutor/chat", json=CHAT_BODY, headers=auth_header())
    assert response.status_code == 429
    assert response.json()["error"]["code"] == "daily_limit_reached"


def test_chat_streams_sse(client, monkeypatch):
    override_settings(groq_api_key="test-key")
    monkeypatch.setattr(tutor_router, "check_and_increment_usage", allow_usage)

    async def fake_stream(settings, messages, system_prompt):
        yield 'data: {"text": "Hi!"}\n\n'
        yield "data: [DONE]\n\n"

    monkeypatch.setattr(tutor_router, "stream_chat", fake_stream)
    response = client.post("/api/tutor/chat", json=CHAT_BODY, headers=auth_header())
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert '"text": "Hi!"' in response.text
    assert "data: [DONE]" in response.text


def test_quiz_happy_path(client, monkeypatch):
    override_settings(groq_api_key="test-key")
    monkeypatch.setattr(quiz_router, "check_and_increment_usage", allow_usage)

    async def fake_json(settings, system_prompt, user_prompt):
        return {
            "questions": [
                {
                    "question": "How do you greet someone in the morning?",
                    "options": ["Good morning", "Good night", "Goodbye", "See you"],
                    "answer_index": 0,
                    "explanation": "'Good morning' is the morning greeting.",
                }
            ]
        }

    monkeypatch.setattr(quiz_router, "complete_json", fake_json)
    response = client.post("/api/quiz/generate", json=QUIZ_BODY, headers=auth_header())
    assert response.status_code == 200
    data = response.json()
    assert len(data["questions"]) == 1
    assert data["questions"][0]["answer_index"] == 0


def test_quiz_invalid_ai_output_returns_502(client, monkeypatch):
    override_settings(groq_api_key="test-key")
    monkeypatch.setattr(quiz_router, "check_and_increment_usage", allow_usage)

    async def bad_json(settings, system_prompt, user_prompt):
        return {"questions": [{"question": "q", "options": ["a", "b"], "answer_index": 5, "explanation": "e"}]}

    monkeypatch.setattr(quiz_router, "complete_json", bad_json)
    response = client.post("/api/quiz/generate", json=QUIZ_BODY, headers=auth_header())
    assert response.status_code == 502
    assert response.json()["error"]["code"] == "ai_bad_output"

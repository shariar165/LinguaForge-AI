from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi.testclient import TestClient

from app import auth as auth_module
from app.config import Settings, get_settings
from app.main import app

SECRET = "test-secret-for-unit-tests"


@pytest.fixture(autouse=True)
def override_settings():
    app.dependency_overrides[get_settings] = lambda: Settings(
        supabase_jwt_secret=SECRET, frontend_origins="http://localhost:3000"
    )
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=False)


def make_token(exp_minutes: int = 30, secret: str = SECRET, aud: str = "authenticated") -> str:
    payload = {
        "sub": "00000000-0000-0000-0000-000000000001",
        "email": "student@example.com",
        "aud": aud,
        "exp": datetime.now(UTC) + timedelta(minutes=exp_minutes),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def test_health_is_public(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_missing_token_returns_401(client):
    response = client.post(
        "/api/pronunciation/score", json={"target_text": "hello", "transcript": "hello"}
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthorized"


def test_expired_token_returns_401(client):
    token = make_token(exp_minutes=-5)
    response = client.post(
        "/api/pronunciation/score",
        json={"target_text": "hello", "transcript": "hello"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "token_expired"


def test_wrong_secret_returns_401(client):
    token = make_token(secret="wrong-secret")
    response = client.post(
        "/api/pronunciation/score",
        json={"target_text": "hello", "transcript": "hello"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "invalid_token"


def test_valid_token_allows_scoring(client):
    token = make_token()
    response = client.post(
        "/api/pronunciation/score",
        json={"target_text": "Good morning", "transcript": "good morning"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["score"] == 100


def test_es256_token_verified_via_jwks(client):
    """New Supabase projects sign tokens with asymmetric keys (JWKS), not the HS256 secret."""
    supabase_url = "http://supabase.test"
    app.dependency_overrides[get_settings] = lambda: Settings(
        supabase_jwt_secret=SECRET, supabase_url=supabase_url, frontend_origins="http://localhost:3000"
    )
    private_key = ec.generate_private_key(ec.SECP256R1())
    token = jwt.encode(
        {
            "sub": "00000000-0000-0000-0000-000000000002",
            "aud": "authenticated",
            "exp": datetime.now(UTC) + timedelta(minutes=30),
        },
        private_key,
        algorithm="ES256",
        headers={"kid": "test-key"},
    )
    fake_jwks = SimpleNamespace(get_signing_key_from_jwt=lambda t: SimpleNamespace(key=private_key.public_key()))
    auth_module._jwks_clients[supabase_url] = fake_jwks
    try:
        response = client.post(
            "/api/pronunciation/score",
            json={"target_text": "Good morning", "transcript": "good morning"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
    finally:
        auth_module._jwks_clients.pop(supabase_url, None)


def test_validation_error_shape(client):
    token = make_token()
    response = client.post(
        "/api/pronunciation/score",
        json={"target_text": "", "transcript": "hello"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"

from dataclasses import dataclass

import jwt
from fastapi import Depends, Request
from jwt import PyJWKClient

from .config import Settings, get_settings
from .errors import ApiError

# One JWKS client per Supabase project URL; PyJWKClient caches the keys (1h).
_jwks_clients: dict[str, PyJWKClient] = {}


@dataclass(frozen=True)
class AuthedUser:
    id: str
    email: str | None


def _signing_key(token: str, settings: Settings) -> tuple[object, list[str]]:
    """Return (key, allowed_algorithms) for this token.

    Legacy Supabase projects sign access tokens with the shared HS256 JWT
    secret; projects on the newer signing-keys system use asymmetric keys
    (ES256/RS256) published at the project's JWKS endpoint. Support both.
    """
    try:
        alg = jwt.get_unverified_header(token).get("alg", "HS256")
    except jwt.InvalidTokenError as exc:
        raise ApiError(401, "invalid_token", "Invalid authentication token.") from exc

    if alg == "HS256":
        if not settings.supabase_jwt_secret:
            raise ApiError(503, "auth_not_configured", "Authentication is not configured on the server.")
        return settings.supabase_jwt_secret, ["HS256"]

    if not settings.supabase_url:
        raise ApiError(503, "auth_not_configured", "Authentication is not configured on the server.")
    client = _jwks_clients.get(settings.supabase_url)
    if client is None:
        client = PyJWKClient(
            f"{settings.supabase_url}/auth/v1/.well-known/jwks.json",
            cache_keys=True,
            lifespan=3600,
        )
        _jwks_clients[settings.supabase_url] = client
    try:
        return client.get_signing_key_from_jwt(token).key, ["ES256", "RS256"]
    except jwt.exceptions.PyJWKClientError as exc:
        raise ApiError(401, "invalid_token", "Invalid authentication token.") from exc


def get_current_user(
    request: Request, settings: Settings = Depends(get_settings)
) -> AuthedUser:
    """Verify the Supabase access token sent as `Authorization: Bearer <jwt>`."""
    header = request.headers.get("authorization", "")
    if not header.lower().startswith("bearer "):
        raise ApiError(401, "unauthorized", "Missing authentication token.")
    token = header[7:].strip()

    key, algorithms = _signing_key(token, settings)
    try:
        payload = jwt.decode(
            token,
            key,
            algorithms=algorithms,
            audience="authenticated",
            options={"require": ["exp", "sub"]},
        )
    except jwt.ExpiredSignatureError as exc:
        raise ApiError(401, "token_expired", "Your session has expired. Please sign in again.") from exc
    except jwt.InvalidTokenError as exc:
        raise ApiError(401, "invalid_token", "Invalid authentication token.") from exc

    return AuthedUser(id=payload["sub"], email=payload.get("email"))

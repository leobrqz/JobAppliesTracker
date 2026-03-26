from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from urllib.parse import urljoin
from uuid import UUID

import jwt
from fastapi import HTTPException, status
from jwt import PyJWKClient
from jwt.exceptions import DecodeError
from jwt.exceptions import ExpiredSignatureError
from jwt.exceptions import InvalidAudienceError
from jwt.exceptions import InvalidIssuerError
from jwt.exceptions import InvalidSignatureError
from jwt.exceptions import InvalidTokenError

from app.core.config import settings


@dataclass(frozen=True)
class AuthUser:
    user_id: UUID
    email: str | None


def _build_jwks_url() -> str:
    base = (settings.SUPABASE_URL or "").strip()
    if not base:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="SUPABASE_URL is not configured")
    return urljoin(base.rstrip("/") + "/", "auth/v1/.well-known/jwks.json")


def _build_expected_issuer() -> str | None:
    issuer = (settings.SUPABASE_JWT_ISSUER or "").strip()
    if issuer:
        return issuer
    return None


@lru_cache(maxsize=1)
def _jwk_client() -> PyJWKClient:
    return PyJWKClient(_build_jwks_url())


def verify_bearer_token(token: str) -> AuthUser:
    decode_kwargs = {
        "audience": settings.SUPABASE_JWT_AUDIENCE,
    }
    issuer = _build_expected_issuer()
    if issuer:
        decode_kwargs["issuer"] = issuer

    try:
        if settings.SUPABASE_JWT_VERIFICATION_MODE == "hs256":
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                **decode_kwargs,
            )
        else:
            try:
                signing_key = _jwk_client().get_signing_key_from_jwt(token)
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Token verification service unavailable",
                ) from None
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256", "ES256"],
                **decode_kwargs,
            )
    except HTTPException:
        raise
    except (ExpiredSignatureError, InvalidAudienceError, InvalidIssuerError, InvalidSignatureError, DecodeError, InvalidTokenError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from None
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token verification failed") from None

    sub = payload.get("sub")
    if not isinstance(sub, str):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token subject missing")

    try:
        user_id = UUID(sub)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token subject is invalid") from None

    email = payload.get("email")
    if email is not None and not isinstance(email, str):
        email = None

    return AuthUser(user_id=user_id, email=email)


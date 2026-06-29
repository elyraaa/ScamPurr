from collections import defaultdict, deque
from time import monotonic
from typing import Callable

from fastapi import HTTPException, Request, status

from app.config import get_settings

WINDOW_SECONDS = 60
_BUCKETS: dict[str, deque[float]] = defaultdict(deque)


def _client_key(request: Request, scope: str) -> str:
    authorization = request.headers.get("authorization", "")
    if authorization.lower().startswith("bearer "):
        token_prefix = authorization[7:47]
        return f"{scope}:token:{token_prefix}"

    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client = forwarded_for.split(",", 1)[0].strip()
    elif request.client:
        client = request.client.host
    else:
        client = "unknown"

    return f"{scope}:ip:{client}"


def _rate_limit(scope: str, limit_getter: Callable[[], int]):
    async def dependency(request: Request) -> None:
        limit = max(1, limit_getter())
        now = monotonic()
        key = _client_key(request, scope)
        bucket = _BUCKETS[key]

        while bucket and now - bucket[0] >= WINDOW_SECONDS:
            bucket.popleft()

        if len(bucket) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please wait before trying again.",
            )

        bucket.append(now)

    return dependency


auth_rate_limit = _rate_limit(
    "auth",
    lambda: get_settings().RATE_LIMIT_AUTH_PER_MINUTE,
)
analysis_rate_limit = _rate_limit(
    "analysis",
    lambda: get_settings().RATE_LIMIT_ANALYSIS_PER_MINUTE,
)

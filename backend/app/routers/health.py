from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "ok",
        "service": "ScamPurr AI API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

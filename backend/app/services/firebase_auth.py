"""
Firebase Authentication Service
--------------------------------
Supports two modes:
  - MOCK MODE  (FIREBASE_MOCK_AUTH=true):  accepts any token, returns decoded payload
                                            using the token string itself as the UID.
                                            Perfect for local development without Firebase.
  - REAL MODE  (FIREBASE_MOCK_AUTH=false): verifies against Firebase Admin SDK.
"""
import logging
from typing import Optional, Dict, Any

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Lazy-init Firebase app to avoid crash if credentials not configured
_firebase_initialized = False


def _init_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return True
    try:
        import firebase_admin
        from firebase_admin import credentials

        if settings.FIREBASE_CREDENTIALS_PATH:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        else:
            # Use Application Default Credentials (works on GCP/Cloud Run)
            cred = credentials.ApplicationDefault()

        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
        logger.info("Firebase Admin SDK initialized.")
        return True
    except Exception as e:
        logger.warning(f"Firebase initialization failed: {e}. Running in mock mode.")
        return False


async def verify_firebase_token(id_token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a Firebase ID token and return the decoded claims dict,
    or None if verification fails.
    """
    if settings.FIREBASE_MOCK_AUTH:
        # ── Mock Mode ─────────────────────────────────────────────────────
        # In mock mode the token IS the user identifier.
        # The frontend sends a fake token like "demo-user-1" for local dev.
        logger.debug(f"[MOCK AUTH] Accepting token as UID: {id_token[:40]}")
        return {
            "uid": id_token,
            "email": f"{id_token.replace(' ', '_')}@demo.scampurr.ai",
            "name": "Demo User",
            "picture": None,
        }

    # ── Real Mode ─────────────────────────────────────────────────────────
    if not _init_firebase():
        logger.error("Firebase not initialized; cannot verify token.")
        return None

    try:
        from firebase_admin import auth as firebase_auth
        decoded = firebase_auth.verify_id_token(id_token)
        return decoded
    except Exception as e:
        logger.warning(f"Token verification failed: {e}")
        return None

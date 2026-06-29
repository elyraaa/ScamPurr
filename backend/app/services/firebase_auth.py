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
import json
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

        # Priority 1: Service account JSON from environment variable
        if settings.FIREBASE_SERVICE_ACCOUNT_JSON:
            service_account = json.loads(
                settings.FIREBASE_SERVICE_ACCOUNT_JSON
            )
            cred = credentials.Certificate(service_account)

        # Priority 2: Credentials file
        elif settings.FIREBASE_CREDENTIALS_PATH:
            cred = credentials.Certificate(
                settings.FIREBASE_CREDENTIALS_PATH
            )

        # Priority 3: Google Application Default Credentials
        else:
            cred = credentials.ApplicationDefault()

        firebase_admin.initialize_app(cred)

        _firebase_initialized = True

        logger.info("Firebase Admin SDK initialized successfully.")
        logger.info(f"FIREBASE_MOCK_AUTH = {settings.FIREBASE_MOCK_AUTH}")

        return True

    except Exception:
        logger.exception("Firebase initialization failed")
        return False

async def verify_firebase_token(id_token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a Firebase ID token and return the decoded claims dict,
    or None if verification fails.
    """

    logger.info(f"FIREBASE_MOCK_AUTH = {settings.FIREBASE_MOCK_AUTH}")

    # ── Mock Mode ─────────────────────────────────────────────────────
    if settings.FIREBASE_MOCK_AUTH:
        logger.info("Using MOCK Firebase authentication")

        return {
            "uid": id_token,
            "email": f"{id_token.replace(' ', '_')}@demo.scampurr.ai",
            "name": "Demo User",
            "picture": None,
        }

    # ── Real Mode ─────────────────────────────────────────────────────
    if not _init_firebase():
        logger.error("Firebase not initialized; cannot verify token.")
        return None

    try:
        from firebase_admin import auth as firebase_auth

        logger.info("Using REAL Firebase authentication")

        decoded = firebase_auth.verify_id_token(id_token)

        return decoded

except Exception:
    logger.exception("Firebase token verification failed")
    return None
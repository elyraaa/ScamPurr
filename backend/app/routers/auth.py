import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import TokenVerifyRequest, AuthResponse, UserResponse
from app.services.firebase_auth import verify_firebase_token

router = APIRouter()


@router.post("/verify", response_model=AuthResponse)
async def verify_and_upsert_user(
    body: TokenVerifyRequest,
    db: Session = Depends(get_db),
):
    """
    Verify Firebase ID token and upsert user in the database.
    Called by frontend on every login/session restore.
    Returns the DB user record.
    """
    decoded = await verify_firebase_token(body.id_token)
    if not decoded:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token",
        )

    firebase_uid = decoded.get("uid") or decoded.get("sub", "")
    email = decoded.get("email", f"{firebase_uid}@unknown.local")
    display_name = decoded.get("name") or decoded.get("display_name")
    photo_url = decoded.get("picture")

    # Upsert: find existing or create new user
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            firebase_uid=firebase_uid,
            email=email,
            display_name=display_name,
            photo_url=photo_url,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        message = "User registered successfully"
    else:
        # Update mutable fields
        if display_name:
            user.display_name = display_name
        if photo_url:
            user.photo_url = photo_url
        db.commit()
        db.refresh(user)
        message = "User verified"

    return AuthResponse(user=UserResponse.model_validate(user), message=message)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    db: Session = Depends(get_db),
    # Note: This endpoint uses the dependency directly for simplicity
    # In production you'd use the get_current_user dep from deps.py
):
    """
    Placeholder for profile endpoint. In real use, inject get_current_user dep.
    """
    raise HTTPException(status_code=501, detail="Use /auth/verify to get user profile.")

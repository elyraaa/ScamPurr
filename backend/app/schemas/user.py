from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    firebase_uid: str
    email: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    firebase_uid: str
    email: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenVerifyRequest(BaseModel):
    id_token: str


class AuthResponse(BaseModel):
    user: UserResponse
    message: str

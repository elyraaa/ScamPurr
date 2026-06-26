from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.models.analysis import AnalysisType


class ListingAnalysisRequest(BaseModel):
    text: str
    url: Optional[str] = None  # Optional URL to also analyze

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        if not v or len(v.strip()) < 20:
            raise ValueError("Listing text must be at least 20 characters")
        return v.strip()

    @field_validator("url")
    @classmethod
    def url_format_check(cls, v: Optional[str]) -> Optional[str]:
        if v and not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


class UrlAnalysisRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def url_must_be_valid(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v.strip()


class AnalysisResponse(BaseModel):
    id: str
    type: AnalysisType
    input_text: Optional[str] = None
    input_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.models.analysis import AnalysisType


MIN_LISTING_TEXT_CHARS = 20
MAX_LISTING_TEXT_CHARS = 5000
MAX_URL_CHARS = 2048


class ListingAnalysisRequest(BaseModel):
    text: str
    url: Optional[str] = None  # Optional URL to also analyze

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        text = v.strip() if v else ""
        if len(text) < MIN_LISTING_TEXT_CHARS:
            raise ValueError(f"Listing text must be at least {MIN_LISTING_TEXT_CHARS} characters")
        if len(text) > MAX_LISTING_TEXT_CHARS:
            raise ValueError(f"Listing text must be {MAX_LISTING_TEXT_CHARS} characters or fewer")
        return text

    @field_validator("url")
    @classmethod
    def url_format_check(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        url = v.strip()
        if len(url) > MAX_URL_CHARS:
            raise ValueError(f"URL must be {MAX_URL_CHARS} characters or fewer")
        if not url.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return url


class UrlAnalysisRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def url_must_be_valid(cls, v: str) -> str:
        url = v.strip() if v else ""
        if len(url) > MAX_URL_CHARS:
            raise ValueError(f"URL must be {MAX_URL_CHARS} characters or fewer")
        if not url.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return url


class AnalysisResponse(BaseModel):
    id: str
    type: AnalysisType
    input_text: Optional[str] = None
    input_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

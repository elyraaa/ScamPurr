from sqlalchemy import Column, DateTime, Integer, String, func

from app.database import Base


class AppMetric(Base):
    __tablename__ = "app_metrics"

    key = Column(String(80), primary_key=True)
    value = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import get_settings

settings = get_settings()

connect_args: dict = {}
pool_kwargs: dict = {}

if settings.USE_SQLITE:
    # SQLite doesn't support server-side pooling args
    connect_args = {"check_same_thread": False}
else:
    # PostgreSQL — use connection pooling appropriate for serverless/Render
    pool_kwargs = {
        "pool_size": 5,
        "max_overflow": 10,
    }

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300,
    **pool_kwargs,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency: yield a database session, ensure cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_all_tables():
    """Create all tables from ORM models. Called at startup."""
    from app.models import user, analysis, risk_score, app_metric  # noqa: F401

    Base.metadata.create_all(bind=engine)

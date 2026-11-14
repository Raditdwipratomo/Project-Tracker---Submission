from collections.abc import AsyncGenerator
from functools import lru_cache

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


class Base(DeclarativeBase):
    """Base declarative class for SQLAlchemy ORM models."""


@lru_cache
def get_engine() -> AsyncEngine:
    """Create and cache the async SQLAlchemy engine with connection pooling."""
    settings = get_settings()
    url = settings.async_database_url

    engine_kwargs: dict[str, object] = {
        "echo": settings.DB_ECHO,
        "pool_pre_ping": True,
    }
    # Connection pooling options apply to client-server pools like PostgreSQL, not SQLite.
    if not url.startswith("sqlite"):
        engine_kwargs.update(
            {
                "pool_size": settings.DB_POOL_SIZE,
                "max_overflow": settings.DB_MAX_OVERFLOW,
                "pool_recycle": 1800,
            }
        )

    return create_async_engine(url, **engine_kwargs)


@lru_cache
def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Return cached async session factory bound to the primary engine."""
    return async_sessionmaker(
        bind=get_engine(),
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )


async def init_db() -> None:
    """Create database tables automatically on application startup."""
    # Ensure ORM models are imported and registered on Base.metadata before create_all.
    import app.models.task  # noqa: F401

    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Dispose the engine and release pooled database connections on shutdown."""
    engine = get_engine()
    await engine.dispose()
    get_session_factory.cache_clear()
    get_engine.cache_clear()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session and roll back automatically on unhandled errors."""
    session_factory = get_session_factory()
    async with session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise

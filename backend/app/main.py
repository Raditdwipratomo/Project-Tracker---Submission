from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health_router, tasks_router
from app.core.config import get_settings
from app.core.database import close_db, init_db


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Initialize database schema on startup and dispose pooled connections on shutdown."""
    await init_db()
    yield
    await close_db()


def create_app() -> FastAPI:
    """Construct and configure the FastAPI application instance."""
    settings = get_settings()

    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="RESTful API for Simple Task / Project Tracker.",
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    application.include_router(health_router)
    application.include_router(tasks_router)

    return application


app = create_app()

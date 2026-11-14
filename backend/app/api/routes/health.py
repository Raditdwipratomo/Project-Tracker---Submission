from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import text

from app.api.dependencies import DBSessionDep

router = APIRouter(prefix="/health", tags=["health"])


class HealthResponse(BaseModel):
    """Health check payload indicating API and database readiness."""

    status: str
    database: str


@router.get("")
async def health_check(db: DBSessionDep) -> HealthResponse:
    """Verify API availability and database connectivity."""
    try:
        await db.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed.",
        ) from exc
    return HealthResponse(status="ok", database="connected")

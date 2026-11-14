from datetime import UTC, datetime
from typing import Annotated

from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    Field,
    StringConstraints,
    field_validator,
    model_validator,
)

from app.models.task import TaskStatus

TitleStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]


def _normalize_optional_description(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped if stripped else None


OptionalDescription = Annotated[
    Annotated[str, Field(max_length=5000)] | None,
    AfterValidator(_normalize_optional_description),
]


class TaskCreate(BaseModel):
    """Payload schema for creating a new task."""

    title: TitleStr
    description: OptionalDescription = None
    status: TaskStatus = TaskStatus.TODO


class TaskUpdate(BaseModel):
    """Payload schema for updating an existing task (supports partial or full updates)."""

    title: TitleStr | None = None
    description: OptionalDescription = None
    status: TaskStatus | None = None

    @model_validator(mode="after")
    def validate_update_fields(self) -> "TaskUpdate":
        if not self.model_fields_set:
            raise ValueError("At least one field must be provided for update.")
        if "title" in self.model_fields_set and self.title is None:
            raise ValueError("Title cannot be null or empty.")
        if "status" in self.model_fields_set and self.status is None:
            raise ValueError("Status cannot be null.")
        return self


class TaskRead(BaseModel):
    """Response schema representing a persisted task."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    status: TaskStatus
    created_at: datetime
    updated_at: datetime

    @field_validator("created_at", "updated_at", mode="after")
    @classmethod
    def ensure_utc_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value.astimezone(UTC)


class TaskDeleteResponse(BaseModel):
    """Response schema returned after deleting a task."""

    message: str
    id: int

from datetime import datetime
from enum import StrEnum

from sqlalchemy import BigInteger, CheckConstraint, DateTime, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TaskStatus(StrEnum):
    """Allowed workflow states for a task."""

    TODO = "Todo"
    IN_PROGRESS = "In Progress"
    DONE = "Done"


class Task(Base):
    """SQLAlchemy ORM model representing a task item in PostgreSQL."""

    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint("length(trim(title)) > 0", name="ck_tasks_title_not_blank"),
        CheckConstraint(
            "status IN ('Todo', 'In Progress', 'Done')",
            name="ck_tasks_valid_status",
        ),
        Index("ix_tasks_created_at_desc", "created_at", "id"),
        Index("ix_tasks_status", "status"),
    )

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True,
        autoincrement=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=TaskStatus.TODO.value,
        server_default=TaskStatus.TODO.value,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

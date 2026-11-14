from collections.abc import Sequence
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate


class TaskRepository:
    """Data-access layer for Task persistence operations."""

    async def list_all(
        self,
        db: AsyncSession,
        status: TaskStatus | None = None,
    ) -> Sequence[Task]:
        """Return tasks ordered newest-first, optionally filtered by status."""
        stmt = select(Task)
        if status is not None:
            stmt = stmt.where(Task.status == status.value)
        stmt = stmt.order_by(Task.created_at.desc(), Task.id.desc())
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, db: AsyncSession, task_id: int) -> Task | None:
        """Fetch a single task by primary key."""
        result = await db.execute(select(Task).where(Task.id == task_id))
        return result.scalars().first()

    async def create(self, db: AsyncSession, payload: TaskCreate) -> Task:
        """Insert a new task row and return the refreshed ORM entity."""
        task = Task(
            title=payload.title,
            description=payload.description,
            status=payload.status.value,
        )
        db.add(task)
        await db.commit()
        await db.refresh(task)
        return task

    async def update(self, db: AsyncSession, task: Task, payload: TaskUpdate) -> Task:
        """Apply partial or full updates to an existing task and persist changes."""
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "status" and isinstance(value, TaskStatus):
                setattr(task, field, value.value)
            else:
                setattr(task, field, value)

        # Ensure updated_at always advances across both PostgreSQL and SQLite test runs.
        task.updated_at = datetime.now(UTC)
        await db.commit()
        await db.refresh(task)
        return task

    async def delete(self, db: AsyncSession, task: Task) -> None:
        """Delete an existing task row and commit the transaction."""
        await db.delete(task)
        await db.commit()


task_repository = TaskRepository()

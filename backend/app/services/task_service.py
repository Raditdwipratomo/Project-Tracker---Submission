from collections.abc import Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task, TaskStatus
from app.repositories.task_repository import TaskRepository, task_repository
from app.schemas.task import TaskCreate, TaskUpdate


class TaskNotFoundError(Exception):
    """Raised when a requested task ID does not exist."""

    def __init__(self, task_id: int) -> None:
        self.task_id = task_id
        super().__init__(f"Task with id {task_id} was not found.")


class TaskService:
    """Application service encapsulating task business workflows."""

    def __init__(self, repository: TaskRepository) -> None:
        self.repository = repository

    async def list_tasks(
        self,
        db: AsyncSession,
        status: TaskStatus | None = None,
    ) -> Sequence[Task]:
        return await self.repository.list_all(db, status=status)

    async def create_task(self, db: AsyncSession, payload: TaskCreate) -> Task:
        return await self.repository.create(db, payload)

    async def update_task(
        self,
        db: AsyncSession,
        task_id: int,
        payload: TaskUpdate,
    ) -> Task:
        task = await self.repository.get_by_id(db, task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        return await self.repository.update(db, task, payload)

    async def delete_task(self, db: AsyncSession, task_id: int) -> None:
        task = await self.repository.get_by_id(db, task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        await self.repository.delete(db, task)


task_service = TaskService(repository=task_repository)

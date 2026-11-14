from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.task_service import TaskService, task_service


def get_task_service() -> TaskService:
    """Provide the task service instance."""
    return task_service


DBSessionDep = Annotated[AsyncSession, Depends(get_db)]
TaskServiceDep = Annotated[TaskService, Depends(get_task_service)]

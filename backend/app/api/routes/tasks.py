from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, Query, status

from app.api.dependencies import DBSessionDep, TaskServiceDep
from app.models.task import TaskStatus
from app.schemas.task import TaskCreate, TaskDeleteResponse, TaskRead, TaskUpdate
from app.services.task_service import TaskNotFoundError

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("")
async def list_tasks(
    db: DBSessionDep,
    service: TaskServiceDep,
    task_status: Annotated[TaskStatus | None, Query(alias="status")] = None,
) -> list[TaskRead]:
    """Retrieve all tasks ordered from newest to oldest, optionally filtered by status."""
    tasks = await service.list_tasks(db, status=task_status)
    return [TaskRead.model_validate(task) for task in tasks]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    db: DBSessionDep,
    service: TaskServiceDep,
) -> TaskRead:
    """Create a new task."""
    task = await service.create_task(db, payload)
    return TaskRead.model_validate(task)


@router.put("/{task_id}")
async def update_task(
    task_id: Annotated[int, Path(ge=1, description="Unique task identifier")],
    payload: TaskUpdate,
    db: DBSessionDep,
    service: TaskServiceDep,
) -> TaskRead:
    """Update a task's title, description, and/or status."""
    try:
        task = await service.update_task(db, task_id, payload)
    except TaskNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found.",
        ) from exc
    return TaskRead.model_validate(task)


@router.delete("/{task_id}")
async def delete_task(
    task_id: Annotated[int, Path(ge=1, description="Unique task identifier")],
    db: DBSessionDep,
    service: TaskServiceDep,
) -> TaskDeleteResponse:
    """Delete a task by its ID."""
    try:
        await service.delete_task(db, task_id)
    except TaskNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found.",
        ) from exc
    return TaskDeleteResponse(message="Task deleted successfully.", id=task_id)

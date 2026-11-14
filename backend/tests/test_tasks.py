import pytest
from httpx import AsyncClient

from app.core.config import Settings


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient) -> None:
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "connected"}


@pytest.mark.asyncio
async def test_list_tasks_empty(client: AsyncClient) -> None:
    response = await client.get("/tasks")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_task_full_and_defaults(client: AsyncClient) -> None:
    create_full = await client.post(
        "/tasks",
        json={
            "title": "  Setup FastAPI Project  ",
            "description": "  Configure PostgreSQL and CORS  ",
            "status": "In Progress",
        },
    )
    assert create_full.status_code == 201
    full_data = create_full.json()
    assert full_data["id"] >= 1
    assert full_data["title"] == "Setup FastAPI Project"
    assert full_data["description"] == "Configure PostgreSQL and CORS"
    assert full_data["status"] == "In Progress"
    assert "created_at" in full_data
    assert "updated_at" in full_data

    create_minimal = await client.post(
        "/tasks",
        json={"title": "Write unit tests", "description": "   "},
    )
    assert create_minimal.status_code == 201
    min_data = create_minimal.json()
    assert min_data["title"] == "Write unit tests"
    assert min_data["description"] is None
    assert min_data["status"] == "Todo"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"title": ""},
        {"title": "   "},
        {"title": None},
        {"title": "A" * 256},
        {"title": "Valid title", "status": "Archived"},
        {"title": "Valid title", "status": "todo"},
    ],
)
async def test_create_task_validation_errors(client: AsyncClient, payload: dict) -> None:
    response = await client.post("/tasks", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_tasks_ordering_and_status_filter(client: AsyncClient) -> None:
    first = (await client.post("/tasks", json={"title": "First task", "status": "Todo"})).json()
    second = (await client.post("/tasks", json={"title": "Second task", "status": "Done"})).json()

    all_response = await client.get("/tasks")
    assert all_response.status_code == 200
    all_tasks = all_response.json()
    assert [task["id"] for task in all_tasks] == [second["id"], first["id"]]

    done_response = await client.get("/tasks", params={"status": "Done"})
    assert done_response.status_code == 200
    done_tasks = done_response.json()
    assert len(done_tasks) == 1
    assert done_tasks[0]["id"] == second["id"]


@pytest.mark.asyncio
async def test_update_task_partial_full_and_clear_description(client: AsyncClient) -> None:
    created = (
        await client.post(
            "/tasks",
            json={
                "title": "Initial Title",
                "description": "Initial Description",
                "status": "Todo",
            },
        )
    ).json()
    task_id = created["id"]

    # Partial update: status only
    status_res = await client.put(f"/tasks/{task_id}", json={"status": "In Progress"})
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["title"] == "Initial Title"
    assert status_data["description"] == "Initial Description"
    assert status_data["status"] == "In Progress"

    # Clear description explicitly with null and update title
    edit_res = await client.put(
        f"/tasks/{task_id}",
        json={"title": "  Updated Title  ", "description": None, "status": "Done"},
    )
    assert edit_res.status_code == 200
    edit_data = edit_res.json()
    assert edit_data["title"] == "Updated Title"
    assert edit_data["description"] is None
    assert edit_data["status"] == "Done"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"title": ""},
        {"title": "   "},
        {"title": None},
        {"status": None},
        {"status": "Invalid"},
    ],
)
async def test_update_task_validation_errors(client: AsyncClient, payload: dict) -> None:
    created = (await client.post("/tasks", json={"title": "Sample"})).json()
    response = await client.put(f"/tasks/{created['id']}", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_update_and_delete_missing_task_returns_404(client: AsyncClient) -> None:
    update_res = await client.put("/tasks/99999", json={"status": "Done"})
    assert update_res.status_code == 404

    delete_res = await client.delete("/tasks/99999")
    assert delete_res.status_code == 404


@pytest.mark.asyncio
async def test_delete_task_success(client: AsyncClient) -> None:
    created = (await client.post("/tasks", json={"title": "Task to delete"})).json()
    task_id = created["id"]

    delete_res = await client.delete(f"/tasks/{task_id}")
    assert delete_res.status_code == 200
    assert delete_res.json()["id"] == task_id

    list_res = await client.get("/tasks")
    assert list_res.status_code == 200
    assert list_res.json() == []


@pytest.mark.asyncio
async def test_cors_preflight_allows_frontend_origin(client: AsyncClient) -> None:
    response = await client.options(
        "/tasks",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_settings_normalizes_database_url_and_origins() -> None:
    settings = Settings(
        DATABASE_URL="postgresql://postgres:password@localhost:5432/task_tracker_db",
        ALLOWED_ORIGINS="http://localhost:5173, http://localhost:3000",
    )
    assert (
        settings.async_database_url
        == "postgresql+asyncpg://postgres:password@localhost:5432/task_tracker_db"
    )
    assert settings.cors_origins == ["http://localhost:5173", "http://localhost:3000"]

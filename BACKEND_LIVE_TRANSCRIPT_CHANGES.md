# Backend Changes: Live Transcript Message Storage

## Overview

The frontend now uses Gemini Live (WebSocket-based, audio-first) instead of the old REST-based chat.
Gemini Live runs **directly between the browser and Google**, so the backend never sees individual
messages in real time. The frontend captures transcriptions client-side and pushes them to a new
backend endpoint so that the existing performance-report pipeline (which reads from Upstash Redis)
continues to work unchanged.

## What already exists (no changes needed)

| Endpoint | Purpose |
|---|---|
| `POST /api/v1/sessions/` | Create a session row (persona_id, mode_id, optional scenario_id). Frontend now calls this **before** navigating to the audio visualizer. |
| `POST /api/v1/performance-reports/` | Generate a performance report. Reads chat history from Redis key `user:{user_id}:session:{session_id}`. **No changes needed.** |

## New endpoint required

### `POST /api/v1/sessions/{session_id}/messages`

Stores a single chat message (user or AI) into the same Upstash Redis history that the
performance-report pipeline reads from.

### Auth

Bearer JWT — uses `get_current_user` dependency (same as other session endpoints).

### Request body

```json
{
  "role": "human",
  "content": "Tell me about your current sales process."
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| `role` | string | yes | `"human"` or `"assistant"` |
| `content` | string | yes | The message text |

### Response

```json
{ "status": "ok" }
```

**Status codes:**

| Code | Meaning |
|---|---|
| 200 | Message stored |
| 400 | Invalid role or empty content |
| 404 | Session not found or doesn't belong to the current user |
| 401 | Unauthorized |

### Sample FastAPI implementation

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from langchain_community.chat_message_histories import UpstashRedisChatMessageHistory
from langchain_core.messages import HumanMessage, AIMessage

from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User
from app.crud.sessions import get_session_by_id  # your existing session lookup

router = APIRouter()


class StoreMessageRequest(BaseModel):
    role: str
    content: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in ("human", "assistant"):
            raise ValueError("role must be 'human' or 'assistant'")
        return v

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("content must not be empty")
        return v


@router.post("/sessions/{session_id}/messages")
async def store_session_message(
    session_id: str,
    body: StoreMessageRequest,
    current_user: User = Depends(get_current_user),
):
    session = await get_session_by_id(session_id)
    if not session or str(session.user_id) != str(current_user.user_id):
        raise HTTPException(status_code=404, detail="Session not found")

    history = UpstashRedisChatMessageHistory(
        url=settings.upstash_redis_rest_url,
        token=settings.upstash_redis_rest_token,
        session_id=f"user:{current_user.user_id}:session:{session_id}",
    )

    if body.role == "human":
        history.add_message(HumanMessage(content=body.content))
    else:
        history.add_message(AIMessage(content=body.content))

    return {"status": "ok"}
```

### Redis key pattern

```
user:{user_id}:session:{session_id}
```

This is the **same key** that `PerformanceReportDAL.get_session_history` reads when generating
reports — no changes needed on the report side.

### Call pattern from frontend

1. User selects a persona and mode → frontend calls `POST /sessions/` → receives `session_id`.
2. Frontend navigates to `/audio-visualizer/{session_id}` and connects to Gemini Live.
3. As each message finishes (voice transcription completes or user types a message), the frontend
   calls `POST /sessions/{session_id}/messages` with the role and content.
4. When the session ends, the user (or frontend) can call `POST /performance-reports/` with the
   `session_id` to generate the report — the Redis history is already populated.

### Idempotency note

The frontend tracks a `synced` flag per message in sessionStorage to avoid re-sending messages
after a page reload. However, if a message is sent twice (e.g., due to a network retry), it will
be appended again to the Redis list. This is acceptable since the performance report LLM can
handle minor duplicates, but an optional server-side deduplication (e.g., by message hash) could
be added later.

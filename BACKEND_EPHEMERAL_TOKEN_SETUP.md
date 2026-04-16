# Gemini Ephemeral Token -- FastAPI Backend Setup

This guide covers everything needed to add a `/api/v1/gemini/ephemeral-token` endpoint to your FastAPI backend so the frontend never exposes the raw Gemini API key.

---

## 1. Prerequisites

| Requirement | Minimum version |
|-------------|-----------------|
| Python      | 3.9+            |
| FastAPI     | 0.100+          |
| `google-genai` Python SDK | 1.10+ (must support `auth_tokens.create`) |

Install the SDK:

```bash
pip install google-genai
```

Or add to your `requirements.txt`:

```
google-genai>=1.10.0
```

---

## 2. Environment Variable

Move the Gemini API key from the frontend `.env` to your **backend** `.env`. The key must **never** appear in client-side code.

```env
# backend .env
GEMINI_API_KEY=AIzaSy...your_real_key_here...
```

Load it however your project already reads env vars (`pydantic-settings`, `python-dotenv`, `os.environ`, etc.).

---

## 3. Endpoint Code

Create a new router file (e.g. `routers/gemini.py`) or add to an existing one -- follow whatever pattern your project already uses.

```python
import datetime
import os

from fastapi import APIRouter, Depends, HTTPException
from google import genai

router = APIRouter(prefix="/gemini", tags=["gemini"])

# Singleton client -- thread-safe for token creation, avoids re-init per request.
_gemini_client: genai.Client | None = None


def get_gemini_client() -> genai.Client:
    global _gemini_client
    if _gemini_client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set in environment variables")
        _gemini_client = genai.Client(
            api_key=api_key,
            http_options={"api_version": "v1alpha"},
        )
    return _gemini_client


@router.post("/ephemeral-token")
async def create_ephemeral_token(
    # ------------------------------------------------
    # IMPORTANT: Uncomment and wire your auth dependency
    # so only logged-in users can request tokens.
    #
    # current_user = Depends(get_current_user),
    # ------------------------------------------------
    client: genai.Client = Depends(get_gemini_client),
):
    """
    Create a short-lived Gemini ephemeral token for the Live API.

    - `uses: 1`  --> token can only start ONE WebSocket session
    - `expire_time: 30 min`  --> session must finish within 30 minutes
    - `new_session_expire_time: 2 min`  --> unused token expires in 2 minutes
    - `live_connect_constraints`  --> locked to specific model + audio-only
    """
    now = datetime.datetime.now(tz=datetime.timezone.utc)

    try:
        token = client.auth_tokens.create(
            config={
                "uses": 1,
                "expire_time": now + datetime.timedelta(minutes=30),
                "new_session_expire_time": now + datetime.timedelta(minutes=2),
                "live_connect_constraints": {
                    "model": "gemini-3.1-flash-live-preview",
                    "config": {
                        "response_modalities": ["AUDIO"],
                        "session_resumption": {},
                        "context_window_compression": {
                            "sliding_window": {},
                        },
                    },
                },
                "http_options": {"api_version": "v1alpha"},
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to create ephemeral token: {e}",
        )

    return {
        "token": token.name,
        "expires_at": (now + datetime.timedelta(minutes=30)).isoformat(),
    }
```

---

## 4. Register the Router

In your main FastAPI app file (e.g. `main.py` or `app.py`):

```python
from routers.gemini import router as gemini_router

app.include_router(gemini_router, prefix="/api/v1")
```

The endpoint will be available at:

```
POST http://127.0.0.1:8000/api/v1/gemini/ephemeral-token
```

---

## 5. Auth Protection

The endpoint **must** be protected by your existing auth dependency. Without it, anyone can hit the endpoint and mint tokens against your API key.

Typical pattern (adjust to match your project):

```python
from your_auth_module import get_current_user

@router.post("/ephemeral-token")
async def create_ephemeral_token(
    current_user = Depends(get_current_user),   # <-- add this
    client: genai.Client = Depends(get_gemini_client),
):
    ...
```

The frontend sends `credentials: 'include'` on the fetch request, which forwards the `auth_token` cookie your app already uses.

---

## 6. CORS Configuration

Your FastAPI app must allow the frontend origin. If you already have CORS middleware, verify it includes:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Vite dev server
        "https://your-production-domain.com",
    ],
    allow_credentials=True,           # Required for cookie auth
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Key: `allow_credentials=True` is required because the frontend sends cookies.

---

## 7. Testing with curl

### Without auth (for initial testing only):

```bash
curl -X POST http://127.0.0.1:8000/api/v1/gemini/ephemeral-token
```

### With auth cookie:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/gemini/ephemeral-token \
  -H "Content-Type: application/json" \
  --cookie "auth_token=YOUR_JWT_HERE"
```

---

## 8. Expected Response

Success (`200 OK`):

```json
{
  "token": "ya29.a0AfH6SM..._ephemeral_token_string...",
  "expires_at": "2026-04-01T15:30:00+00:00"
}
```

The frontend uses `token` as the `apiKey` when calling `new GoogleGenAI({ apiKey: token })`.

Error (`502 Bad Gateway`):

```json
{
  "detail": "Failed to create ephemeral token: <error message from Google>"
}
```

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `403 Forbidden` from Google | API key doesn't have Generative Language API enabled, or key restrictions block server IP | Enable the API in Google Cloud Console; check key restrictions |
| `ModuleNotFoundError: google.genai` | Wrong package installed | Use `pip install google-genai` (not `google-generativeai`) |
| `AttributeError: 'Client' has no attribute 'auth_tokens'` | SDK version too old | Upgrade: `pip install --upgrade google-genai` |
| CORS error in browser console | Frontend origin not in `allow_origins` or `allow_credentials` is `False` | Update CORS middleware (see section 6) |
| `401 Unauthorized` | Auth dependency rejects request | Check that the `auth_token` cookie is being sent and is valid |
| Token works once then fails | `uses: 1` means one session per token | The frontend re-fetches a new token for each session (already handled) |

---

## 10. Security Best Practices

- **`uses: 1`** -- Each token can only start one WebSocket session. Even if extracted from the network tab, it is already consumed.
- **`new_session_expire_time: 2 min`** -- An unconsumed stolen token becomes useless in 2 minutes.
- **`live_connect_constraints`** -- Locks the token to a specific model and audio-only responses. It cannot be repurposed for text generation, image generation, or other models.
- **Never log `token.name`** in production -- treat it like a short-lived secret.
- **Rate-limit the endpoint** -- Consider adding a rate limiter (e.g. `slowapi`) to prevent abuse: 5-10 tokens per user per hour is reasonable.
- **The real `GEMINI_API_KEY` never leaves your server.**

---

## 11. How It Fits Together

```
Browser (GdmLiveAudio)
  │
  │  POST /api/v1/gemini/ephemeral-token  (with auth_token cookie)
  ▼
FastAPI Backend
  │
  │  client.auth_tokens.create(uses=1, expire=30min, model locked)
  ▼
Google GenAI API
  │
  │  Returns: { name: "ephemeral-token-string" }
  ▼
FastAPI Backend
  │
  │  Returns: { token: "ephemeral-token-string", expires_at: "..." }
  ▼
Browser (GdmLiveAudio)
  │
  │  new GoogleGenAI({ apiKey: token })
  │  live.connect({ model: "gemini-3.1-flash-live-preview" })
  ▼
Google GenAI API (WebSocket)
  │  Token is visible in network tab but is single-use and expires in minutes.
```

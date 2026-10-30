"""
Celebration Planner — FastAPI backend
Rules applied: B1 (clean code), B2 (AI guardrails), architecture.md sections 6-8

Run locally:
    pip install -r requirements.txt
    cp .env.example .env        # add your ANTHROPIC_API_KEY
    uvicorn main:app --reload
"""

import json
import os
import time
from collections import defaultdict
from typing import Generator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

load_dotenv()

# ── Configuration ────────────────────────────────────────────
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL      = os.getenv("CLAUDE_MODEL", "claude-3-haiku-20240307")
MAX_DAILY_CALLS   = int(os.getenv("MAX_DAILY_CALLS", "50"))  # per IP

app = FastAPI(
    title="Celebration Planner API",
    description="AI-powered event planning backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Serve the frontend from the same process in development
if os.path.exists("index.html"):
    app.mount("/", StaticFiles(directory=".", html=True), name="static")

# ── Rate limiting (in-memory; use Redis in production) ───────
_rate_store: dict[str, list[float]] = defaultdict(list)

def check_rate_limit(ip: str) -> None:
    now = time.time()
    calls = [t for t in _rate_store[ip] if now - t < 86_400]
    if len(calls) >= MAX_DAILY_CALLS:
        raise HTTPException(status_code=429, detail="Daily AI request limit reached. Try again tomorrow.")
    calls.append(now)
    _rate_store[ip] = calls

# ── Idea cache (in-memory; key = event fingerprint) ──────────
_idea_cache: dict[str, list[dict]] = {}

def cache_key(event: dict) -> str:
    return f"{event['type']}|{event['guests']}|{event['budget']}|{event['currency']}|{event.get('notes','')[:80]}"

# ── Pydantic models ───────────────────────────────────────────
class EventContext(BaseModel):
    type:     str = Field(..., min_length=1, max_length=20)
    name:     str = Field(..., min_length=1, max_length=80)
    date:     str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    guests:   int = Field(..., ge=1, le=10_000)
    budget:   int = Field(..., ge=1)
    currency: str = Field(..., min_length=3, max_length=3)
    notes:    str = Field("", max_length=500)

class IdeasRequest(BaseModel):
    event: EventContext

class ChatMessage(BaseModel):
    role:    str = Field(..., pattern=r"^(user|assistant)$")
    content: str = Field(..., min_length=1, max_length=2000)

class ChatRequest(BaseModel):
    event:    EventContext
    messages: list[ChatMessage] = Field(..., max_length=20)

# ── AI helpers ────────────────────────────────────────────────
def get_anthropic_client():
    """Lazy import — app still starts without the package installed."""
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured.")
    try:
        import anthropic
        return anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    except ImportError:
        raise HTTPException(status_code=503, detail="AI library not installed on server.")

def event_context_block(event: EventContext) -> str:
    """Plain-text context injected into every AI prompt."""
    return (
        f"Event type: {event.type}\n"
        f"Event name: {event.name}\n"
        f"Event date: {event.date}\n"
        f"Guests: {event.guests}\n"
        f"Budget: {event.budget} {event.currency}\n"
        f"Notes: {event.notes or 'none'}"
    )

IDEAS_SYSTEM = """You are a celebration planning assistant.
Return ONLY a JSON array (no markdown, no extra text) of exactly 8 objects.
Each object must have exactly these keys:
  "category" (string, max 20 chars)
  "title"    (string, max 50 chars)
  "detail"   (string, max 120 chars)

Rules you must follow:
- Never invent specific vendor names, phone numbers or prices.
- Label ideas as suggestions; do not guarantee availability.
- Keep ideas practical and relevant to the budget and guest count.
- Tailor ideas to the event type, date and notes provided."""

CHAT_SYSTEM = """You are a knowledgeable, friendly celebration planning assistant.
You have full context of the user's event (below). Keep answers concise (under 200 words).
Never invent vendor names, phone numbers, or specific prices.
Label suggestions as ideas — always recommend confirming details with real local vendors.
If asked something unrelated to event planning, politely redirect."""

# ── Routes ───────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "model": CLAUDE_MODEL}

@app.post("/api/ideas")
async def generate_ideas(body: IdeasRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(client_ip)

    ck = cache_key(body.event.model_dump())
    if ck in _idea_cache:
        return {"ideas": _idea_cache[ck], "cached": True}

    client = get_anthropic_client()
    prompt = f"{event_context_block(body.event)}\n\nGenerate 8 creative, practical ideas for this event."

    # Attempt with one automatic retry on malformed JSON
    for attempt in range(2):
        try:
            message = client.messages.create(
                model=CLAUDE_MODEL,
                max_tokens=1024,
                system=IDEAS_SYSTEM,
                messages=[{"role": "user", "content": prompt}],
            )
            raw = message.content[0].text.strip()
            # Strip possible code fences
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            ideas = json.loads(raw)
            if not isinstance(ideas, list):
                raise ValueError("Response is not a JSON array")
            # Validate and sanitise each idea
            clean = []
            for idea in ideas[:12]:
                clean.append({
                    "category": str(idea.get("category", ""))[:20],
                    "title":    str(idea.get("title",    ""))[:50],
                    "detail":   str(idea.get("detail",   ""))[:120],
                })
            _idea_cache[ck] = clean
            return {"ideas": clean, "cached": False}
        except (json.JSONDecodeError, ValueError, KeyError):
            if attempt == 1:
                raise HTTPException(status_code=502, detail="AI returned an unexpected format. Please retry.")

@app.post("/api/chat")
async def chat(body: ChatRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(client_ip)

    client = get_anthropic_client()
    system = f"{CHAT_SYSTEM}\n\n--- Event context ---\n{event_context_block(body.event)}"

    messages = [{"role": m.role, "content": m.content} for m in body.messages[-10:]]

    def stream_tokens() -> Generator[str, None, None]:
        with client.messages.stream(
            model=CLAUDE_MODEL,
            max_tokens=512,
            system=system,
            messages=messages,
        ) as stream:
            for text in stream.text_stream:
                yield f"data: {text}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream_tokens(), media_type="text/event-stream")

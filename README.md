# Celebration Planner 🎉

> **AI-powered celebration and community event planner** — built for the Smart India Hackathon (SIH).

Turn "I'm organising a wedding / birthday / community event" into a **budget, a dated timeline, a vendor checklist and personalised AI ideas in under 2 minutes.**

🔗 **Live demo:** https://tanmay-biswal5.github.io/celebration-planner/

---

## Features

| Feature | Status |
|---|---|
| 3 event types: Wedding, Birthday, Community | ✅ MVP |
| Budget split with editable % and spend tracking | ✅ MVP |
| Countdown timeline with real dates and overdue tags | ✅ MVP |
| Vendor checklist with status tracking | ✅ MVP |
| AI-generated ideas (8 per event, cached) | ✅ MVP |
| AI chat with event context | ✅ MVP |
| Export budget as CSV | ✅ MVP |
| Print-friendly view | ✅ MVP |
| Light & dark mode | ✅ MVP |
| Works offline (AI features gracefully degrade) | ✅ MVP |
| LocalStorage persistence | ✅ MVP |
| FastAPI backend + streaming chat | ✅ MVP |
| WCAG AA accessibility | ✅ MVP |
| Responsive down to 360 px | ✅ MVP |
| Multiple events + sign-in | 🔜 v1 |
| PDF export | 🔜 v1 |
| Share link for co-organisers | 🔜 v1 |
| Email / WhatsApp reminders | 🔜 v2 |
| Hindi and regional language UI | 🔜 v2 |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Python 3.11 + FastAPI |
| AI | Anthropic Claude API (streaming SSE) |
| Storage | `localStorage` (MVP) → SQLite → PostgreSQL |
| Deployment | Any static host + Render / Railway free tier |

---

## Quick Start

### Frontend only (no AI)
```bash
# Just open index.html in a browser — no server needed.
# Budget, timeline and vendors all work offline.
open index.html
```

### Full stack (with AI features)
```bash
# 1. Clone
git clone https://github.com/Tanmay-Biswal5/celebration-planner.git
cd celebration-planner

# 2. Backend
pip install -r requirements.txt
cp .env.example .env
# → edit .env and add your ANTHROPIC_API_KEY

# 3. Run
uvicorn main:app --reload
# → open http://localhost:8000
```

---

## Project Structure

```
celebration-planner/
├── index.html          # Single-page frontend
├── style.css           # Design tokens + responsive layout
├── app.js              # All frontend logic (vanilla JS)
├── main.py             # FastAPI backend + AI endpoints
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variable template
├── .gitignore
└── README.md
```

---

## Architecture

```
User browser ──HTTPS──▶ Frontend (HTML + JS)
                              │
                         REST + SSE
                              │
                        FastAPI backend
                       ┌──────┴──────┐
                  Template        AI service
                  engine         (Claude API)
                  (budget,       (ideas + chat)
                  timeline,
                  vendors)
```

---

## AI Guardrails (rules.md B2)

- Never invents vendor names, phone numbers or prices
- Labels all output as **suggestions** — "Ideas to explore. Confirm prices with real vendors."
- App is fully usable when AI is down (fallback template ideas shown)
- Ideas are cached per event setup to reduce API costs
- Rate-limited: max 50 AI calls per IP per day

---

## Accessibility (rules.md B3)

- WCAG AA contrast in light and dark mode
- All inputs have labels; all buttons are keyboard-reachable
- No horizontal scroll at 360 px width
- Screen-reader friendly headings, roles and live regions

---

## SIH Evaluation Criteria

| Criterion | Evidence |
|---|---|
| Novelty | Template reliability + AI personalisation for Indian events in one flow |
| Complexity | Template engine, AI validation, streaming chat, localStorage persistence |
| Clarity | Clear tab structure, plain language, no jargon |
| Feasibility | Working prototype; phased roadmap from MVP to full product |
| Practicability | Works on phone, with or without internet / AI |
| Sustainability | Free-tier hosting; cached and rate-limited AI calls |
| Scale of impact | Families, parents, RWAs, clubs, rural community events across India |
| User experience | Under 2-minute first plan; WCAG AA; dark mode; offline-capable |
| Future progression | Share links, reminders, multilingual, vendor directory |

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit with clear messages: `feat: add vendor status`, `fix: overdue date`
4. Open a pull request

---

## License

MIT — free to use, modify and distribute.

---

_Built with ❤️ for Smart India Hackathon 2026_

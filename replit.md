# Savorah

AI-powered adaptive personal finance platform (students, professionals, families, seniors).

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS + Recharts
- **Backend:** Express (TypeScript) in `server/`
- **Database:** MongoDB via Mongoose
- **Auth:** JWT (email/password) + mock Google login + demo persona logins
- **AI:** OpenRouter free models (`OPENROUTER_API_KEY`)

## Setup

1. Copy `.env.example` to `.env` and fill in:
   - `MONGODB_URI` (local Docker Mongo or Atlas)
   - `JWT_SECRET`
   - `OPENROUTER_API_KEY` from https://openrouter.ai/keys
2. Install: `npm install`
3. Run MongoDB (e.g. `docker run -d -p 27017:27017 mongo:7`)
4. Dev server: `npm run dev` (default port **5055** — macOS often reserves 5000)

## Free OpenRouter models used

| Feature | Model |
|---------|--------|
| Financial coach chat | `nvidia/nemotron-3-super-120b-a12b:free` |
| Budget / insights / monthly report | `openai/gpt-oss-20b:free` |
| Auto-categorize | `google/gemma-4-26b-a4b-it:free` |
| Vision (receipts) | `nvidia/nemotron-3-nano-omni:free` |
| Fallback | `openrouter/free` |

## API overview

- `POST /api/auth/register|login|google|demo`
- `GET /api/auth/me`
- `PATCH /api/users/me`, `POST /api/users/me/onboarding`
- CRUD: `/api/transactions`, `/api/budgets`, `/api/goals`, `/api/notifications`
- `GET /api/analytics/summary`
- AI: `/api/ai/budget-recommendation`, `auto-categorize`, `insights`, `chat`, `monthly-report`

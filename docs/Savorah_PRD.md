# Savorah — Product Requirements Document

**Version:** 2.0  
**Status:** Active product (full-stack MVP)  
**Last updated:** 24 July 2026  
**Product name:** Savorah  
**Tagline:** Track your money, so you can pretend you’re in control.

---

## 1. Executive summary

Savorah is an **AI-powered personal finance platform** built for four life stages — **students, working professionals, families, and senior citizens**. One shared data engine powers all users; the **dashboard tone, AI advice, and onboarding budgets** adapt to the selected persona.

Unlike generic budgeting apps that force every user into the same template, Savorah treats personal finance as something that changes across a lifetime. Users track income and expenses in **Indian Rupees (₹)**, set budgets and goals, import transactions from **SMS, receipts, and bank statements**, and get plain-language coaching from **OpenRouter free models** grounded in their real account data.

> **Product thesis:** Instead of one budgeting system for everyone, Savorah adapts to every stage of life using AI-driven personalization — on a practical, hackathon-to-production stack.

---

## 2. Problem statement

### 2.1 Why personal finance is hard
- Manual expense tracking feels tedious; most people abandon apps within weeks.
- Irregular student income, salary + investments, shared household spend, and fixed pensions behave very differently — yet most apps treat them the same.
- Users want advice, not just a ledger.

### 2.2 Gaps in existing apps
| Gap | Impact |
|-----|--------|
| Generic templates | A 19-year-old and a 65-year-old see the same cluttered UI |
| Passive tracking | Logs spend but does not say what to do next |
| Blank-page budgeting | Users do not know how to set category limits |
| Manual-only entry | Typing every UPI SMS is friction that kills retention |
| Western-default currency UX | Indian users need ₹, UPI, and local merchant context |

### 2.3 How AI helps
- Instant starter budgets from persona + income.
- Auto-categorization and import from SMS / receipt / statement.
- Plain-language insights and a coach that knows *this* user’s numbers — not generic tips.

---

## 3. Vision, mission, and goals

| | |
|--|--|
| **Vision** | Anyone — regardless of age, income, or financial literacy — can manage money with confidence, guided by AI that understands their life stage. |
| **Mission** | Replace one-size-fits-all budgeting with an adaptive platform that tailors dashboards, insights, and recommendations to how a person actually lives and earns. |
| **North-star outcome** | User completes onboarding → has a usable budget → logs or imports spend → receives persona-aware AI advice within the first session. |

### Success metrics (product)
- Onboarding completable in **under 3 minutes**.
- AI starter budget applied in **under 1 minute** (or safe percentage fallback if AI is down).
- Expense flow (add → categorize → view) understandable without a walkthrough.
- AI responses reference **real user totals in ₹**, never invent balances.
- Dashboard reflects new transactions after save (context refresh / reload).

---

## 4. Target users (personas)

### 4.1 Student
- **Goals:** Track allowance / part-time income; build a saving habit; avoid running out before month-end.
- **Pain:** Many small irregular spends; low cushion; low motivation for manual logging.
- **Primary features:** Expense tracking, budget alerts, AI spending insights, savings goals.

### 4.2 Working professional
- **Goals:** Manage salary; plan monthly budgets; save toward home / travel / investments.
- **Pain:** Little time to track; generic advice that ignores personal goals.
- **Primary features:** Budget planner, goal planning, AI budget recommendation, analytics.

### 4.3 Family
- **Goals:** Track shared household expenses; manage bills; plan for children’s / family needs.
- **Pain:** Many categories; hard to see leaks; due dates easy to miss.
- **Primary features:** Categories, transaction history, budget limits, bill-oriented notifications (roadmap).

### 4.4 Senior citizen
- **Goals:** Monitor fixed / pension income; track essentials; keep finances simple and predictable.
- **Pain:** Low tolerance for complex UI; anxiety about surprises.
- **Primary features:** Simplified dashboard, monthly summary, budget alerts, AI monthly report.

---

## 5. Solution overview

```text
Signup → Choose persona → Onboarding (income / goals)
      → AI starter budget → Adaptive dashboard
      → Add / import transactions → Budgets & goals
      → AI insights & coach → Achieve goals
```

### Design principles
1. **Shared core, adaptive shell** — One MongoDB schema and API; presentation + AI system context change by persona.
2. **India-first money UX** — Currency ₹, `en-IN` formatting, UPI / bank SMS / INR prompts.
3. **AI must be honest** — Grounded in DB data; clear errors if the API key is missing; no fake “success” replies.
4. **Reduce entry friction** — Manual entry plus SMS, receipt, and statement import.
5. **Clarity over chrome** — Clean navigation, one job per screen, no demo clutter on login.

---

## 6. Scope

### 6.1 In scope (current product — v2)
| Area | Requirements |
|------|----------------|
| **Auth** | Register, login (email/password + JWT), mock Google sign-in for demos, session restore via `/api/auth/me` |
| **Onboarding** | Persona + monthly income; AI starter budget (fallback percentage allocation) |
| **Dashboard** | Persona-adaptive overview: income, expense, savings, over-budget alerts, AI insights & monthly report |
| **Transactions** | Full CRUD; search/filter; add hub (manual / SMS / receipt / statement) |
| **Budgets** | Category limits, spent vs remaining, AI recommend & apply |
| **Goals** | Create, contribute, delete; celebrate / notify on achievement |
| **Analytics** | Pie + trend charts from live transaction data (client) |
| **AI Coach** | Chat grounded in user’s transactions, budgets, goals (INR) |
| **AI utilities** | Auto-categorize, insights, monthly report, parse SMS / statement / receipt |
| **Notifications** | Server-side budget-exceeded and goal-achieved events; list in finance context |
| **Locale** | Indian Rupees (₹) as default currency |

### 6.2 Out of scope / future
| Item | Notes |
|------|--------|
| Real Google OAuth | Currently mock upsert; needs Google Client ID/secret |
| Multi-user family accounts | Shared budgets across members |
| Bill reminders / recurring txs | Cron or scheduled jobs |
| Cloudinary + OCR pipeline | Receipt today uses OpenRouter vision |
| Native mobile apps | Web SPA only |
| Paid / premium AI tiers | Free OpenRouter models for MVP |
| Business / B2B mode | Prototype component exists; not in primary nav |
| Multi-currency switching | Field exists; product is INR-first |

---

## 7. User experience

### 7.1 Information architecture
| Nav item | Purpose |
|----------|---------|
| **Overview** | Adaptive home — health of money at a glance |
| **Transactions** | Ledger + import hub |
| **Budgets** | Category limits and AI allocation |
| **Goals** | Savings targets and progress |
| **Analytics** | Visual breakdowns |
| **AI Coach** | Conversational guidance |

Secondary: Profile modal (name, income, persona, logout, reset demo data), Auth modal.

### 7.2 Key flows

**A. New user**
1. Register with name, email, password, persona, income (₹).
2. Server runs onboarding → AI (or fallback) budgets.
3. Land on Overview; optional AI insights.

**B. Log expense**
1. Add → Manual or import method.
2. Optional AI auto-categorize / parse.
3. Review → Save → Budget spend updates; alert if over limit.

**C. Import statement**
1. Upload CSV (preferred), text PDF, or screenshot.
2. AI extracts rows (CSV has local fallback).
3. Preview, deselect duplicates, import selected.

**D. AI coaching**
1. User asks a question.
2. Server loads live finance context from MongoDB.
3. Model replies in persona tone using only provided ₹ figures.

---

## 8. Functional requirements

### 8.1 Authentication
| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-1 | Email + password register/login with hashed passwords | Must |
| AUTH-2 | JWT issued and required for protected APIs | Must |
| AUTH-3 | Persist session client-side; restore via `/me` | Must |
| AUTH-4 | Mock Google login for demos | Should |
| AUTH-5 | Real Google OAuth | Future |

### 8.2 Adaptive experience
| ID | Requirement | Priority |
|----|-------------|----------|
| ADP-1 | User selects one of four personas | Must |
| ADP-2 | Dashboard copy/widgets adapt by persona | Must |
| ADP-3 | AI system prompts adapt by persona | Must |
| ADP-4 | Onboarding budgets reflect persona + income | Must |

### 8.3 Money tracking
| ID | Requirement | Priority |
|----|-------------|----------|
| TX-1 | CRUD income/expense with category, date, method | Must |
| TX-2 | Categories cover housing, groceries, utilities, etc. | Must |
| TX-3 | Budget limits with computed spent | Must |
| TX-4 | Notify when category spend exceeds limit | Must |
| TX-5 | Savings goals with contribute + achievement notify | Must |
| TX-6 | Display all money in ₹ with Indian grouping | Must |

### 8.4 Imports
| ID | Requirement | Priority |
|----|-------------|----------|
| IMP-1 | Parse UPI/bank SMS into one transaction | Must |
| IMP-2 | Parse bank CSV/statement text into many transactions | Must |
| IMP-3 | Parse receipt image via vision model | Must |
| IMP-4 | Duplicate detection before import | Should |
| IMP-5 | Graceful error if AI key missing; CSV offline fallback | Must |

### 8.5 AI
| ID | Requirement | Priority |
|----|-------------|----------|
| AI-1 | Starter budget recommendation (JSON) | Must |
| AI-2 | Auto-categorize single transaction | Must |
| AI-3 | Spending insights (health score, anomalies) | Must |
| AI-4 | Financial coach chat grounded in DB | Must |
| AI-5 | Monthly plain-language report | Should |
| AI-6 | Never invent balances; INR only in prompts | Must |
| AI-7 | Model failover across free OpenRouter models | Should |

---

## 9. Non-functional requirements

| Area | Requirement |
|------|-------------|
| **Performance** | Dashboard and lists usable on mid-range laptops/phones; AI calls may take 2–15s on free tier |
| **Security** | Passwords bcrypt-hashed; JWT on Authorization header; user-scoped queries |
| **Reliability** | Mongo required at boot; AI failures return clear errors, not silent fake answers |
| **Privacy** | User finance data stored in project MongoDB; OpenRouter processes AI prompts (see provider policy) |
| **Accessibility** | Keyboard-usable primary forms; clear labels; sufficient contrast on primary actions |
| **i18n** | Product copy English; money locale India (`en-IN`, ₹) |
| **Rate limits** | Respect OpenRouter free-tier RPM/RPD; retry alternate free models |

---

## 10. Technical architecture

### 10.1 Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS + Recharts | Fast SPA, charts, component-driven adaptive UI |
| Backend | Node.js + Express (TypeScript) | One language across stack |
| Database | MongoDB + Mongoose | Flexible documents for persona profiles |
| Auth | JWT + bcrypt | Simple, hackathon-friendly, portable |
| AI | OpenRouter free models | No card required; multi-model failover |
| Charts | Recharts | Pie + trends with low setup |

### 10.2 High-level architecture

```text
┌─────────────────┐     JWT      ┌──────────────────┐
│  React SPA      │─────────────▶│  Express API     │
│  Auth/Finance   │◀─────────────│  /api/auth|…|ai  │
│  Contexts       │              └────────┬─────────┘
└─────────────────┘                       │
                              ┌───────────┼───────────┐
                              ▼           ▼           ▼
                         MongoDB     OpenRouter    (static
                         Users/Tx    free models    dist/)
```

### 10.3 Data model (core)

- **User** — name, email, passwordHash, persona, monthlyIncome, currency (₹), onboardingComplete  
- **Transaction** — userId, title, amount, type, category, date, paymentMethod, tags, …  
- **Budget** — userId, category, limit, color (spent computed)  
- **Goal** — userId, title, target/current, deadline, category  
- **Notification** — userId, title, message, type, read  

### 10.4 AI model map (defaults)

| Job | Default free model |
|-----|--------------------|
| Chat coach | `meta-llama/llama-3.3-70b-instruct:free` |
| Structured JSON | `openai/gpt-oss-20b:free` |
| Fast classify / SMS | `meta-llama/llama-3.2-3b-instruct:free` |
| Receipt vision | `google/gemma-4-26b-a4b-it:free` |
| Fallback | `openrouter/free` |

All overridable via env (`OPENROUTER_MODEL_*`).

### 10.5 Environment

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Mongo connection (default DB `savorah_app`) |
| `JWT_SECRET` | Token signing |
| `OPENROUTER_API_KEY` | Required for AI / parsing |
| `OPENROUTER_MODEL_*` | Optional model overrides |
| `APP_URL` | OpenRouter HTTP-Referer |
| `PORT` | Server port (recommend **5055** on macOS; 5000 often taken by AirPlay) |

### 10.6 API map (summary)

- `POST /api/auth/register|login|google|demo` · `GET /api/auth/me`  
- `PATCH /api/users/me` · `POST /api/users/me/onboarding` · `POST /api/users/me/reset-demo`  
- CRUD: `/api/transactions`, `/api/budgets`, `/api/goals`, `/api/notifications`  
- `GET /api/analytics/summary`  
- AI: `/api/ai/budget-recommendation|auto-categorize|insights|chat|monthly-report`  
- Parse: `/api/ai/parse-sms|parse-statement|parse-receipt`  

---

## 11. UI / UX requirements

- **Professional, calm finance UI** — light slate background, emerald primary actions, DM Sans typography.
- **One primary action per view** — e.g. Overview = understand health; Transactions = log/import.
- **No login-page demo persona spam** — clean auth; persona chosen at signup / profile.
- **Mobile** — horizontal tab strip + FAB for add; desktop sticky sidebar.
- **Honest empty/error states** — especially when OpenRouter key is unset.

---

## 12. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Free AI rate limits / model rotation | Failover chain + clear user errors; CSV offline fallback |
| Hallucinated financial advice | Ground prompts in Mongo aggregates; forbid inventing balances |
| Import format variety across banks | Prefer CSV; document export path; AI for messy text |
| Seed data vs INR scale mismatch | Keep incomes INR-scale; align demo seed amounts in follow-up |
| Port conflicts on macOS | Default docs to 5055 |

---

## 13. Roadmap

### Phase 1 — Done (v2 MVP)
- Full-stack auth, Mongo persistence, INR UI  
- Adaptive dashboard + budgets, goals, transactions  
- OpenRouter coaching, insights, reports  
- SMS / receipt / statement parsing  

### Phase 2 — Near term
- Align all seed/demo amounts to realistic INR  
- Notification inbox UI (mark read from bell)  
- Wire analytics summary API or keep documented as client-only  
- Real Google OAuth  

### Phase 3 — Later
- Recurring transactions & bill reminders  
- Family shared wallets  
- Receipt OCR pipeline (Cloudinary)  
- PWA / mobile polish  

---

## 14. Acceptance criteria (demo checklist)

- [ ] Register → persona → income → budgets appear  
- [ ] Add expense → category spent updates  
- [ ] Exceed budget → warning notification created  
- [ ] Contribute to goal until target → success notification  
- [ ] Paste UPI SMS → review form with amount/merchant  
- [ ] Upload CSV statement → preview → import N rows  
- [ ] AI Coach answers using user’s ₹ totals (with API key set)  
- [ ] Without API key, AI surfaces a clear configuration error (no fake advice)  
- [ ] UI remains usable on mobile width  

---

## 15. Appendix

### A. Category catalog
Housing & Rent · Groceries & Dining · Utilities & Bills · Entertainment & Leisure · Education & Books · Healthcare & Medical · Transport & Fuel · Investments & Savings · Shopping & Apparel · Childcare & Family · Salary & Allowance · Other  

### B. Related docs
- Env template: `.env.example`  
- Server entry: `server/index.ts`  
- Domain types: `src/types.ts`  

### C. Positioning statement
> Savorah is the adaptive money app for every life stage — students to seniors — with India-first tracking and an AI coach that actually knows your numbers.

---

**Document owner:** Savorah product team  
**Classification:** Internal / hackathon submission / investor one-pager source  

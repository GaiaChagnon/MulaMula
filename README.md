# Talk to Your Money

A demo **AI-assisted financial assistant** for students. Ask natural-language questions about a mocked budget; a deterministic **finance engine** computes answers from transactions, envelopes, upcoming bills, and savings jars. **OpenRouter** optionally reformats replies for readability without changing numbers or facts.

Live stack: **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Recharts**, browser **SpeechRecognition** for voice input.

## Features

- **Chat** — typed or spoken questions; suggested prompts; `/api/chat` combines intent routing + finance engine + optional OpenRouter formatting.
- **Charts** — pie chart of spending by category; bar-style progress for overall envelopes, per-category budgets, and savings goals.
- **Voice** — Mic button uses the Web Speech API (e.g. Chrome); transcript is sent to the same chat API as typed messages.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` and set variables as needed.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | No | Public site URL (used as OpenRouter referer fallback). |
| `OPENROUTER_API_KEY` | No | If set, chat replies are passed through OpenRouter for formatting only. |
| `OPENROUTER_MODEL` | No | Model id (default `openai/gpt-4o-mini`). See [OpenRouter models](https://openrouter.ai/models). |
| `OPENROUTER_HTTP_REFERER` | No | Overrides referer header for OpenRouter. |
| `OPENROUTER_APP_TITLE` | No | App title sent to OpenRouter (default `Talk to Your Money`). |

Without `OPENROUTER_API_KEY`, the app still works using the raw engine-generated text.

## Project layout

- `app/page.tsx` — Dashboard and chat.
- `app/api/chat/route.ts` — Chat API (intent → engine → OpenRouter format).
- `components/` — `ChatBox`, `VoiceButton`, `FinanceCards`, `SpendingPieChart`, `BudgetProgress`, `BudgetCategoryBars`, `GoalProgress`.
- `lib/mockData.ts` — `userData` mock (transactions, budgets, bills, jars).
- `lib/financeEngine.ts` — Deterministic calculations (`createFinanceEngine`, snapshots, compose replies).
- `lib/intentRouter.ts` — Rule-based intent routing from user text.
- `lib/env.ts` — Reads `NEXT_PUBLIC_APP_URL`.

## Git: mirror Rika52 from GaiaChagnon

This repo is set up with **two remotes**:

| Remote   | Typical URL | Role |
|----------|-------------|------|
| **`gaia`** | `https://github.com/GaiaChagnon/MulaMula.git` | **Source of truth** — pull / sync from here. |
| **`origin`** | `https://github.com/Rika52/mulamula.git` (or SSH) | **Your mirror** — push here so it matches Gaia. |

**One-shot sync (PowerShell)** — resets local `main` to `gaia/main`, then force-pushes to `origin`:

```powershell
npm run sync:mirror
```

Or run `scripts/sync-mirror-from-gaia.ps1` directly. This **drops any local commits on `main` that are not on Gaia’s `main`**, then makes `origin/main` identical to `gaia/main`.

**SSH for `origin`:** if port 22 works on your network:

```powershell
git remote set-url origin git@github.com:Rika52/mulamula.git
```

If SSH times out, keep **HTTPS** for `origin` or use [GitHub’s SSH over port 443](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/using-ssh-over-the-https-port).

**Manual sync without the script:**

```powershell
git fetch gaia
git checkout main
git reset --hard gaia/main
git push origin main --force
```

## Scripts

```bash
npm run dev         # development server (Turbopack)
npm run build       # production build
npm run start       # run production build
npm run lint        # ESLint
npm run sync:mirror # reset main to Gaia and force-push to origin (see above)
```

## Node.js

Next.js 15 expects **Node.js ^18.18 or >=20** (see [Next.js docs](https://nextjs.org/docs/getting-started/installation)). Upgrade if `npm run build` warns about engine version.

## License

Private / course demo unless otherwise noted.

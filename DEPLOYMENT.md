# Deployment Guide

This document explains how DevFiesta is deployed — **Vercel** (frontend) + **Render** (backend) + a **managed MySQL host** (database) — and, more importantly, exactly what had to change in the codebase to make that possible, and *why*. It's written to double as a checklist for deploying any similar frontend/backend/SQL-database project the same way.

---

## 1. Why this stack, and why not Neon

Neon only hosts **Postgres**. This project uses **MySQL** (`mysql2`, raw SQL in every model file, `RANK() OVER`, `GROUP_CONCAT`, etc.), so Neon doesn't apply here — using it would mean rewriting the entire data layer to Postgres syntax across 5+ model files. Instead, the database goes on a **managed MySQL host** (Aiven, Railway, or similar), and every piece of MySQL-specific code stays untouched.

If a future project in this sequence is Postgres-based from the start, Neon becomes the right default and this section doesn't apply.

---

## 2. What "deploy-ready" actually required — the changes and why

A project built and only ever run with `localhost` URLs hardcoded everywhere is not deployable as-is. These are the concrete gaps that were fixed, in the order they'd bite you:

### 2.1 Frontend: hardcoded `http://localhost:4000` in 13 files

**The problem:** Every API call (`axios.get('http://localhost:4000/api/...')`) had the backend's address baked directly into the source, in 21 places across 13 files (`Loginpage.jsx`, `SignupForm.jsx`, `AutoAuth.jsx`, `HackathonContext.jsx`, `Navbar.jsx`, etc.). A production build with this code would always try to reach a `localhost` server — which doesn't exist on the visitor's machine — no matter where the real backend is deployed.

**The fix:** [`frontend/src/utils/api.js`](frontend/src/utils/api.js) exports one constant:
```js
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
```
Every one of those 21 call sites now reads `${API_BASE_URL}/...` instead of the literal string. Locally, nothing changes (the fallback is the same `localhost:4000`). In production, setting one environment variable (`VITE_API_URL`) on Vercel redirects the entire app to the real backend — no code changes, no redeploy of source.

**Why this matters for any project:** this is the single most common reason a "it works on my machine" app fails silently in production — a fetch to `localhost` from a stranger's browser just hangs or gets refused. Centralizing the base URL behind one env-driven constant is the fix, and it should be done *before* the URL count grows past a handful of files.

### 2.2 Backend CORS was locked to one hardcoded origin

**The problem:** [`Backend/server.js`](Backend/server.js) had:
```js
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
```
Once the frontend moves to a `*.vercel.app` domain, every request from it would be rejected by CORS — the backend would work fine when tested directly (e.g. via curl or Postman) but the deployed frontend would fail on every single request with a CORS error in the browser console, which is a confusing failure mode if you don't know to look for it.

**The fix:** `origin` now reads from `CORS_ORIGIN`, a comma-separated env var, defaulting to `http://localhost:3000` for local dev:
```js
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
```
This also lets you list *multiple* allowed origins at once (production domain + Vercel preview-deployment URLs), which a single hardcoded string can't do.

### 2.3 Database connection had no port or SSL support

**The problem:** [`Backend/config/database.js`](Backend/config/database.js) only configured `host`, `user`, `password`, `database` — no `port`. Local Docker MySQL happens to run on the default port 3306, so this was invisible in development. But almost every managed MySQL host (Aiven, PlanetScale-style providers, Railway, TiDB Cloud) does two things differently: they assign a **non-standard port**, and they **require TLS** — a plain connection is refused outright. Without both of these, the very first deploy would crash at `testConnection()` (which calls `process.exit(1)` on failure) before the server even starts listening.

**The fix:** added `port: process.env.DB_PORT || 3306` and an opt-in SSL block gated by `DB_SSL=true`, so local Docker MySQL (which needs neither) is completely unaffected, and a managed host just needs its actual port + `DB_SSL=true` in the env vars.

### 2.4 No database schema existed anywhere in the repo

**The problem:** the entire schema lived only as tribal knowledge in the raw SQL queries scattered across 5 model files — there was no `CREATE TABLE` script to run against a fresh database. This was fixed earlier in this project's history (see [`Backend/db/schema.sql`](Backend/db/schema.sql)), but it's worth restating here: **you cannot deploy a database-backed app without a way to reproducibly create its schema.** Whatever you migrate to (a managed MySQL host here, Neon/Postgres in a different project), the very first deploy step is always "run schema.sql against the new empty database."

### 2.5 No SPA rewrite rule for the frontend host

**The problem:** this is a client-side-routed React app (React Router). A static host serves `index.html` for `/`, but a direct visit or refresh on `/login`, `/hackathons`, `/pbl/login`, etc. is a request for a file that doesn't exist on disk — the host 404s before React Router ever gets a chance to run.

**The fix:** [`frontend/vercel.json`](frontend/vercel.json) rewrites every path back to `index.html`, so the client-side router — not Vercel's static file server — decides what to render:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### 2.6 No infra-as-code for the backend

**The problem:** without a blueprint file, every redeploy of the backend to a new environment means manually re-entering build command, start command, and every environment variable through Render's dashboard — easy to get subtly wrong or forget on the next project.

**The fix:** [`render.yaml`](render.yaml) at the repo root declares the service (`rootDir: Backend`, build/start commands, every env var it needs). Secrets (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `CORS_ORIGIN`) are marked `sync: false` so Render prompts for them once in the dashboard instead of storing them in a file that gets committed to git; `JWT_SECRET` uses `generateValue: true` so Render mints a strong random one automatically.

---

## 3. Deploying this project, step by step

### 3.1 Provision the database (managed MySQL)

Any managed MySQL host works the same way; **Aiven's free tier** is a solid default.

1. Create a MySQL service on your chosen host. Note down: host, port, username, password, database name.
2. Run the schema against it once:
   ```bash
   mysql -h <host> -P <port> -u <user> -p <database> < Backend/db/schema.sql
   ```
   (Aiven/Railway also let you run this through their web SQL console if you don't have the `mysql` CLI installed.)
3. Keep those 4 connection values — you'll paste them into Render in the next step.

### 3.2 Deploy the backend (Render)

1. Push this repo to GitHub (or your git host of choice).
2. In Render: **New → Blueprint**, point it at this repo. Render will read `render.yaml` automatically.
3. When prompted, fill in the `sync: false` values:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` — from step 3.1
   - `CORS_ORIGIN` — leave a placeholder like `http://localhost:3000` for now; you'll update it once the frontend has a real URL (step 3.3)
4. Deploy. Check the logs for `✅ Connected to MySQL database successfully!` — if you instead see a connection error, it's almost always `DB_SSL` not being `true` or the wrong `DB_PORT`.
5. Note your backend's public URL, e.g. `https://devfiesta-backend.onrender.com`.

### 3.3 Deploy the frontend (Vercel)

1. In Vercel: **New Project**, import this repo, set the project root to `frontend/`.
2. Vercel auto-detects Vite; no build command changes needed.
3. Add environment variables (Project Settings → Environment Variables):
   - `VITE_API_URL` = `https://devfiesta-backend.onrender.com/api` (your Render URL + `/api`)
   - `VITE_IMGBB_KEY` = your imgbb API key (see `frontend/.env.example`)
4. Deploy. Note the resulting URL, e.g. `https://devfiesta.vercel.app`.

### 3.4 Close the loop: update CORS

Go back to Render → your backend service → Environment, and set:
```
CORS_ORIGIN=https://devfiesta.vercel.app
```
(Add Vercel preview-deployment URLs too, comma-separated, if you want branch previews to be able to call the API.) Redeploy the backend for the change to take effect.

### 3.5 Verify

- Visit the Vercel URL, sign up a test account, host a hackathon, submit a project — this exercises the full frontend → Render → MySQL round trip.
- If anything fails with a CORS error in the browser console: step 3.4 wasn't applied or the backend wasn't redeployed after it.
- If the backend won't boot: check Render's logs for the MySQL connection error and re-check `DB_SSL`/`DB_PORT`.

---

## 4. Using this project as a template for future deployments

The pattern here generalizes directly to any frontend/backend/SQL project:

1. **Find every hardcoded backend URL in the frontend** (`grep -rn "localhost:PORT" src/`) and route them all through one `API_BASE_URL`-style constant driven by a Vite/CRA env var, *before* touching anything else.
2. **Make CORS origin-configurable**, not hardcoded — a comma-separated env var is enough.
3. **Add a port + SSL toggle to the DB config**, gated by env vars, so local dev is untouched but a managed host's non-default port and TLS requirement are one env var away.
4. **Commit a schema file** the moment a schema exists, even in a side project — it's the difference between a 5-minute deploy and reverse-engineering your own database from query strings.
5. **Add the SPA rewrite rule** for whatever static host you use (Vercel: `vercel.json`; Netlify: `_redirects`; etc.) — any client-side-routed app needs this.
6. **Write the platform's blueprint file** (`render.yaml`, `vercel.json` project settings, `railway.json`, etc.) once, so every future redeploy — including onto a *different* project — is "point the platform at the repo," not "remember every setting by hand."
7. **Deploy database → backend → frontend → close the CORS loop**, in that order. Backend needs the database to exist first; frontend needs the backend's real URL before it can be built with the right `VITE_API_URL`; CORS can only be finalized once the frontend has a real domain.

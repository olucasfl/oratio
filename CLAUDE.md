# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build` (type-checks before bundling)
- `npm run lint` — ESLint over the whole project
- `npm run preview` — serve the production build locally

There is no test runner configured in this project.

## Architecture

This is the React/Vite frontend for **Oratio**, a Catholic prayer app. It talks to a separate NestJS backend (`finance-api`, in a sibling working directory) that also serves a second, unrelated product ("Cravou!") behind the same API — this frontend only ever calls the Oratio side.

- **`src/services/api.ts`** — single Axios instance all API calls go through. Every request carries a fixed `x-app: oratio` header, since the backend uses that header to route between Oratio and Cravou. Handles auth automatically: attaches `Authorization: Bearer <access_token>` from `localStorage`, and on a `401` transparently refreshes the token and replays the original request (queuing concurrent requests during the refresh so they don't all fire duplicate refresh calls). Login/refresh/logout/password-reset endpoints are excluded from that auto-refresh logic — a `401` there is a normal business response (e.g. wrong password), not an expired session, and must not trigger a silent refresh+retry that would swallow the real error message.
- **`src/services/*Service.ts`** — one file per backend domain (auth, profile, consecration, liturgia, prayers, rosary, biblia, activity, admin, vox), each a thin wrapper around `api`.
- **`src/App.tsx`** — all routing lives here (no nested route files). Pages are lazy-loaded via `React.lazy`; a fixed set of "likely next" pages is preloaded during the splash screen (see the `PRELOAD ROUTES` effect) so navigation right after boot doesn't show a loading flash. `ProtectedRoute` / `AdminRoute` gate authenticated and admin-only pages. `App.tsx` also owns a manual cache-busting scheme: bumping the `APP_VERSION` string clears `localStorage` keys matching `oratio`/`stage_`/`consecration` on next load — bump it when shipping a change that invalidates previously cached client-side state.
- **`localStorage`** is the only client persistence: `access_token`/`refresh_token` for auth, plus per-feature cache keys. `clearSession()` in `api.ts` wipes all of it on logout except `app_version` and `last_ping`, deliberately as a catch-all so new cache keys added later don't need to be remembered here individually.
- **Routing structure**: authenticated app pages live under `/oratio/*` (e.g. `/oratio/home`, `/oratio/consecration`, `/oratio/vox`); `/login`, `/register`, and email-verification/reset links are public and outside that prefix.
- **`src/pages/Profile/AdminPanel.tsx`** plus `src/components/Admin*` (`AdminChart`, `AdminHeatmap`, `AdminFilterSheet`) form a small in-app admin dashboard, gated by `AdminRoute`, reading from the backend's admin/system-log endpoints.

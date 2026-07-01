# Project Context & AI Guidelines (AGENTS.md)

> Source of truth = the code. If this file and the code disagree, fix the code
> or fix this file in the same change.

## 1. Project Overview
Platform for healthcare professionals in Venezuela to authenticate, verify their
identity, and report medical-supply needs across public/private health centers.
Uses AI (Gemini) for automated cédula onboarding and a dashboard for
decentralized resource tracking.

## 2. Tech Stack & Architecture
* **Framework:** Next.js (App Router) + React + TypeScript (strict).
* **Styling:** Tailwind CSS. Palette: slate + sky accent. **No dark mode** and
  **no Material Design** in the codebase today.
* **Auth:** Firebase **Authentication only** — `firebase/app` + `firebase/auth`,
  Google (Gmail) popup. There is **no Firestore and no firebase-admin**.
* **Persistence / Backend:** an **external FastAPI (Python) service**, not
  Firebase. Base URL from `API_BASE_URL` (fallback `NEXT_PUBLIC_API_BASE_URL`,
  dev default `http://localhost:4000`). The web app talks to it over a typed
  JSON HTTP client (`lib/api/`).
* **AI / LLM:** Google Generative AI (`@google/generative-ai`), model
  `gemini-2.5-flash`, server-side only.
* **Mapping:** raw **`leaflet`** (`L.map`, `L.marker`) + OpenStreetMap tiles.
  `react-leaflet` is a dependency but is **not used**.
* **Mobile counterpart:** a separate Kotlin Multiplatform (KMP) app is planned
  to consume the same FastAPI. Keep API request/response shapes as strict JSON
  contracts (mirror `lib/api/types.ts`).

### Auth token flow (important)
1. Client signs in with Firebase Google popup (`lib/firebase/google.ts`).
2. The Firebase **ID token** is written to the `fb_token` cookie
   (`lib/firebase/token.ts`, kept in sync by `AuthProvider`).
3. Server Actions and Route Handlers read that cookie (`lib/api/auth.ts`) and
   forward it as `Authorization: Bearer <token>` to the FastAPI backend
   (`lib/api/http.ts`).
4. `middleware.ts` gates `/dashboard/:path*`: no `fb_token` cookie → redirect
   `/`. Client screens additionally guard via `useAuth()`.

## 3. Key Modules
* `lib/api/` — `config.ts` (base URL + `endpoints`), `http.ts` (`apiFetch`,
  `ApiError`, Bearer inject), `types.ts` (schema types), `auth.ts` (cookie
  token), and per-resource callers `centros.ts` / `insumos.ts` / `usuarios.ts`.
* `lib/firebase/` — `client.ts` (app+auth singleton), `config.ts` (env-only
  config), `google.ts`, `token.ts`, `cookie.ts` (`TOKEN_COOKIE = "fb_token"`).
* `lib/genai/cedula.ts` — Gemini OCR (server-only).
* `lib/cedulave/verify.ts` — external cédula validator (server-only).
* `app/api/cedula/route.ts` — Route Handler: OCR → validate.
* `app/actions/` — Server Actions (`centros`, `usuarios`, `insumos`).
* `components/providers/` — `AuthProvider`, `SignUpFlowProvider`.
* `components/hooks/useSignupFlow.ts` — shared sign-up flow (drawer + navbar).

## 4. AI Agents & Automated Workflows

### Agent 1: Identity Extraction (OCR)
* **Model:** `gemini-2.5-flash` (`lib/genai/cedula.ts`).
* **Role:** extract structured data from a Venezuelan Cédula image.
* **Execution:** strictly server-side (Route Handler `app/api/cedula/route.ts`).
  API key server-only (`GEMINI_API_KEY`). Image is sent as base64, processed
  in-memory, never stored.
* **Output schema (strict):** `cedula`, `apellidos`, `nombres`,
  `fecha_nacimiento`, `estado_civil` — illegible fields → `null`, never guessed.
* **Config today:** `responseMimeType: "application/json"` + a `systemInstruction`
  enforcing JSON-only, digits-only cédula, UPPERCASE names, `DD/MM/YYYY`, single
  letter `estado_civil`. (No `temperature` set yet.)

### Agent 2: External Identity Validator
* **Service:** ve-cedula (`lib/cedulave/verify.ts`), server-only.
  `GET {NEXT_CEDULA_VE_API_URL}/cedula/{V|E}/{cedula}` with
  `Authorization: Bearer {NEXT_CEDULA_VE_API_KEY}`.
* **Role:** cross-check the OCR cédula. The client then compares official
  `nombre_completo` tokens against the OCR names; both must agree to enable
  "Finalizar registro".

## 5. Core Features & Data Flow

### Onboarding & Verification
1. **OAuth:** Firebase Google sign-in.
2. **Workplace selection:** search/pick a health center (from
   `GET /api/v1/centros/`). Entry from the navbar with no preselected centro
   shows an autocomplete inside the onboarding screen.
3. **Document upload:** user uploads a JPEG/PNG of their cédula.
4. **Extraction:** `POST /api/cedula` → Gemini OCR.
5. **Validation:** extracted cédula verified via ve-cedula; compared to OCR.
6. **Provisioning:** `POST /api/v1/usuarios/sign-up { centro_id, mpps }` on the
   **FastAPI backend** (this creates the user server-side; **not** Firestore).
   Success → `/dashboard`.

### Dashboard (`/dashboard`, session-protected)
Currently a **3-column** layout (`components/DashboardScreen.tsx`), rendering
**mock data** (`MOCK_*`) — API wiring is pending:
* **Column 1 — Mis centros:** search input + list of associated centros, select
  to set the active centro.
* **Column 2 — Insumos:** list for the selected centro + a form to add insumos.
* **Column 3 — Personal:** users assigned to the selected centro.

### Backend endpoints (`lib/api/config.ts`)
`GET /api/v1/centros/` · `POST /api/v1/usuarios/sign-up` ·
`GET /api/v1/usuarios/sign-in` · `POST /api/v1/insumos/` ·
`GET /api/v1/insumos/by/{centro_id}`.

## 6. Conventions
* **Secrets:** all keys via env (`GEMINI_API_KEY`, `NEXT_CEDULA_VE_API_*`,
  `NEXT_PUBLIC_FIREBASE_*`, `API_BASE_URL`). Never hardcode or commit real
  values; `.env.local` is git-ignored, `.env.example` documents the keys.
* **Server-only:** modules touching secrets/backend import `"server-only"`.
  Client components reach the backend through **Server Actions** or **Route
  Handlers**, never by importing server-only modules.
* **Data fetching:** prefer Server Components / Server Actions; use
  `useTransition` for non-urgent client updates; seed from server to avoid
  waterfalls.
* **Types:** keep `lib/api/types.ts` aligned with the FastAPI schema (the KMP
  app depends on the same contract).
* **Env gating:** `NEXT_PUBLIC_ENVIRONMENT=dev` for localhost; prod on Vercel.
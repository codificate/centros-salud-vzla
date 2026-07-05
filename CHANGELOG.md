# Changelog

All notable changes to this project are documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased] — Insumos catalog, filters & onboarding polish

### Added
- **Tipos de insumos catalog** (`tipos-insumos`, public, no token):
  `lib/api/tiposInsumos.ts` (`getTiposInsumos`, `cache()` + hourly revalidate) and
  `app/actions/tiposInsumos.ts` (`fetchTiposInsumosAction`, `fetchTiposInsumos`).
- **`TiposInsumosAutocomplete`**: session-cached catalog, search by `nombre` or
  `categoría` (case-insensitive). Replaces the free-text `insumo-descripcion`
  input on the dashboard; the "add insumo" payload now carries
  `tipo_id`, `categoria`, `prioridad`, `unidad_medida`.
- **`InsumoPriorityBadge`**: accent/case-normalized priority pill, reused in
  `CentroInsumoItem` and `InsumosPanel`.
- **Server-side insumos filtering** (`lib/api/insumosFilter.ts`): `semanas` (1–2)
  or `desde`/`hasta` (`DD-MM-YYYY`, ≤2 months back, never future) validated and
  serialized to query params; `getInsumosByCentro`/`fetchInsumosAction` accept a
  filter. `PublicInsumosByCentro` drives the fetch from the filter (presets +
  range) with client-side text search on top.
- **`especialidad`** required field in the sign-up flow, threaded through
  `signUpAction` → `signUp` into the request body.
- **Centro distance guard** (`lib/geo.ts`, `distanceKm` haversine): block
  associating a centro >100 km from the first associated one.
- **Onboarding guard + navbar**: `/onboarding` blocks already-registered users
  with a logout / "Ir al listado de centros" dialog; navbar shows "Ir al Panel"
  for signed-in users off the dashboard.
- **`ErrorDialog`**: modal error surface replacing inline `<p>` error labels.

### Changed
- `CentroInsumoItem` gains a `public` prop (default `false`): hides `created_by`
  but keeps `create_at`; `categoría` and `unidad_medida` render on one row.

### Fixed
- `app/error.tsx`: copy fix ("Revísa tu conexión e intenta de nuevo").

## [Unreleased] — Dashboard API integration

### Added
- **Paginated response envelope** (`lib/api/types.ts`): `Paginated<T>` (`{ data,
  pagination }`) now wraps backend responses; API layer returns the envelope,
  server actions unwrap `.data` to the existing model.
- **Associate / dissociate centros** on `/dashboard`: `CentroAutocomplete` to find
  centros, `UserCentroAssociated` list item with a remove control, backed by
  `add/removeCentroAction` (`POST /usuarios/add/centro`,
  `DELETE /usuarios/remove/centro`).
- **Insumos on the dashboard**: load by selected centro (`GET /insumos/by/`,
  cached), add via `POST /insumos/`, rendered with the new `CentroInsumoItem`
  (descripción + cantidad, `created_by · create_at`).
- **Public insumos view** (`PublicInsumosByCentro`): client-side search by
  descripción plus a date filter (1 semana / 2 semanas chips, custom range over
  the last 2 months, apply/clear).
- **Responsive centro drawer**: on wide screens the drawer expands to show
  `PublicInsumosByCentro`; on smaller screens it navigates to the new route
  `/insumos/centro/[centroId]`.
- **`lib/screen.ts`**: `isWideScreen()` helper + `useIsWideScreen()` hook
  (`min-width: 1024px`).
- **Client-side pagination** on `CentrosList` — "Ver más" reveals the next 15.

### Changed
- **Cédula validation** (`lib/cedulave/verify.ts`) migrated to the
  `api.cedula.com.ve` service: query-param auth (`app_id` + `token`), body-level
  `error`/`error_str` handling (`RECORD_NOT_FOUND` → not found, `INVALID_TOKEN` →
  config error).
- `getInsumosByCentro` no longer requires auth (public read).

### Fixed
- Autocomplete dropdown stayed open after selecting a centro; now clears the input
  and closes.

## [Unreleased] — Sign-up flow

### Added
- **Onboarding / sign-up flow** (`/onboarding`): Firebase Google sign-in, health-center
  selection with an autocomplete, cédula photo upload, and final registration.
- **Cédula OCR** via Google Gemini `gemini-2.5-flash` in a server route
  (`app/api/cedula/route.ts`); images are processed in-memory and never stored.
- **Identity validation** against the ve-cedula service (`lib/cedulave/verify.ts`),
  cross-checked against the OCR result before enabling registration.
- **Cédula encryption** (`lib/crypto/aes.ts`): AES-256-GCM with a server-only key,
  sent as `base64(iv‖ciphertext)` in the sign-up payload. Unit tests included.
- **Dashboard** (`/dashboard`): 3-column layout (centros / insumos / personal),
  protected by the Firebase session via `middleware.ts` + a client guard.
- **Navbar** with Login / Regístrate; shared `useSignupFlow` hook and
  `SignupGoogleDialog` reused by the drawer and the navbar.
- **Exit confirmation** on onboarding back-navigation: aborts the sign-up
  (`DELETE /sign-up/abort`), signs out, and clears the auth cookie.
- `AuthProvider` (Firebase) with an `fb_token` cookie, `SignUpFlowProvider`, and
  a typed API layer (`lib/api/*`).
- `AGENTS.md` project guide.

### Fixed
- Centro autocomplete not loading results (StrictMode cleanup flag discarded the
  fetch result).
- Sign-in now redirects to `/dashboard`.
- Sign-up payload `cedula` shape corrected to the string the backend expects.
- Confirmation dialogs centered via a portal (were clipped by the navbar's
  `backdrop-filter` stacking context).
- Drawer overlay pointer-events and z-index above the Leaflet map.
- `RAW_BASE` resolution and `ApiError` message parsing.

### Security
- Moved Firebase web config to environment variables and purged the leaked key
  from git history.
- Cédula is encrypted server-side (server-only key) before reaching the backend.

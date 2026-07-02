# Changelog

All notable changes to this project are documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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

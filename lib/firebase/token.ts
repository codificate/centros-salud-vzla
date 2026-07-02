import { TOKEN_COOKIE } from "./cookie";

/**
 * Persist the Firebase ID token in a cookie so server actions / API calls can
 * forward it as `Authorization: Bearer <token>`. Client-only.
 */
export function setTokenCookie(token: string | null) {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = token
    ? `${TOKEN_COOKIE}=${token}; path=/; max-age=3600; SameSite=Lax${secure}`
    : `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

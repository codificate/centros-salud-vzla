import "server-only";
import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "@/lib/firebase/cookie";

export { TOKEN_COOKIE };

/** Firebase ID token from the request cookies, or null when signed out. */
export async function getServerToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

export async function requireServerToken(): Promise<string> {
  const token = await getServerToken();
  if (!token) throw new Error("Not authenticated");
  return token;
}

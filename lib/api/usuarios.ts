import "server-only";
import { apiFetch } from "./http";
import { endpoints } from "./config";
import { requireServerToken } from "./auth";
import type { UserResponse } from "./types";

/** Return the stored user for the current Firebase token. */
export async function signIn(): Promise<UserResponse> {
  const token = await requireServerToken();
  return apiFetch<UserResponse>(endpoints.signIn, { token });
}

/** Register the current user and assign a centro. */
export async function signUp(
  centroId: number,
  mpps: number
): Promise<UserResponse> {
  const token = await requireServerToken();
  return apiFetch<UserResponse>(endpoints.signUp, {
    method: "POST",
    token,
    json: { centro_id: centroId, mpps },
  });
}

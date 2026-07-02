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
  mpps: number,
  cedula: string
): Promise<UserResponse> {
  const token = await requireServerToken();
  return apiFetch<UserResponse>(endpoints.signUp, {
    method: "POST",
    token,
    json: { centro_id: centroId, mpps, cedula: cedula },
  });
}

/** Abort the sign-up: the backend deletes the Firebase user. */
export async function abortSignUp(): Promise<void> {
  const token = await requireServerToken();
  await apiFetch<void>(endpoints.abortSignUp, { method: "DELETE", token });
}

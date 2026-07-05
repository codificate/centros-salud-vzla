import "server-only";
import { apiFetch } from "./http";
import { endpoints } from "./config";
import { requireServerToken } from "./auth";
import type { UserResponse, Paginated } from "./types";

/** Return the stored user for the current Firebase token. */
export async function signIn(): Promise<Paginated<UserResponse>> {
  const token = await requireServerToken();
  return apiFetch<Paginated<UserResponse>>(endpoints.signIn, { token });
}

/** Register the current user and assign a centro. */
export async function signUp(
  centroId: number,
  mpps: number,
  cedula: string,
  especialidad: string
): Promise<Paginated<UserResponse>> {
  const token = await requireServerToken();
  return apiFetch<Paginated<UserResponse>>(endpoints.signUp, {
    method: "POST",
    token,
    json: { centro_id: centroId, mpps, cedula, especialidad },
  });
}

/** Associate a centro with the current user. */
export async function addCentro(
  centroId: number
): Promise<Paginated<UserResponse>> {
  const token = await requireServerToken();
  return apiFetch<Paginated<UserResponse>>(endpoints.addCentro, {
    method: "PUT",
    token,
    json: { centro_id: centroId },
  });
}

/** Remove a centro association from the current user. */
export async function removeCentro(
  centroId: number
): Promise<Paginated<UserResponse>> {
  const token = await requireServerToken();
  return apiFetch<Paginated<UserResponse>>(endpoints.removeCentro, {
    method: "DELETE",
    token,
    json: { centro_id: centroId },
  });
}

/** Abort the sign-up: the backend deletes the Firebase user. */
export async function abortSignUp(): Promise<void> {
  const token = await requireServerToken();
  await apiFetch<void>(endpoints.abortSignUp, { method: "DELETE", token });
}

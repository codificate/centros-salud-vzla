"use server";

import { signIn, signUp } from "@/lib/api/usuarios";
import { ApiError } from "@/lib/api/http";
import type { UserResponse } from "@/lib/api/types";

export type SignInResult =
  | { status: "exists"; user: UserResponse }
  | { status: "not_found" }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

export async function signInAction(): Promise<SignInResult> {
  try {
    return { status: "exists", user: await signIn() };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 404) return { status: "not_found" };
      if (e.status === 401) return { status: "unauthenticated" };
    }
    if (e instanceof Error && e.message === "Not authenticated")
      return { status: "unauthenticated" };
    return { status: "error", message: "No se pudo iniciar sesión." };
  }
}

export type SignUpResult =
  | { ok: true; user: UserResponse }
  | { ok: false; error: string };

export async function signUpAction(
  centroId: number,
  mpps: number
): Promise<SignUpResult> {
  try {
    return { ok: true, user: await signUp(centroId, mpps) };
  } catch (e) {
    if (e instanceof ApiError && e.status === 409)
      return { ok: false, error: "Ya existe una cuenta para este usuario." };
    return { ok: false, error: "No se pudo completar el registro." };
  }
}

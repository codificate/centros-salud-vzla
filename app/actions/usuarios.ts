"use server";

import {
  signIn,
  signUp,
  abortSignUp,
  addCentro,
  removeCentro,
} from "@/lib/api/usuarios";
import { ApiError } from "@/lib/api/http";
import type { Centro, UserResponse } from "@/lib/api/types";

export type SignInResult =
  | { status: "exists"; user: UserResponse }
  | { status: "not_found" }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

export async function signInAction(): Promise<SignInResult> {
  try {
    const { data } = await signIn();
    return { status: "exists", user: data };
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
  mpps: number,
  cedula: string
): Promise<SignUpResult> {
  try {
    const { data } = await signUp(centroId, mpps, cedula);
    return { ok: true, user: data };
  } catch (e) {
    if (e instanceof ApiError)
      return { ok: false, error: e.message };
    return { ok: false, error: "No se pudo completar el registro." };
  }
}

export type CentrosResult =
  | { ok: true; centros: Centro[] }
  | { ok: false; error: string };

/** Centros the current user is associated with. */
export async function listUserCentrosAction(): Promise<CentrosResult> {
  try {
    const { data } = await signIn();
    return { ok: true, centros: data.centros };
  } catch {
    return { ok: false, error: "No se pudieron cargar tus centros." };
  }
}

export async function addCentroAction(
  centroId: number
): Promise<CentrosResult> {
  try {
    const { data } = await addCentro(centroId);
    return { ok: true, centros: data.centros };
  } catch {
    return { ok: false, error: "No se pudo asociar el centro." };
  }
}

export async function removeCentroAction(
  centroId: number
): Promise<CentrosResult> {
  try {
    const { data } = await removeCentro(centroId);
    return { ok: true, centros: data.centros };
  } catch {
    return { ok: false, error: "No se pudo quitar el centro." };
  }
}

export type AbortSignUpResult =
  | { ok: true }
  | { ok: false; error: string };

export async function abortSignUpAction(): Promise<AbortSignUpResult> {
  try {
    await abortSignUp();
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo cancelar el registro." };
  }
}

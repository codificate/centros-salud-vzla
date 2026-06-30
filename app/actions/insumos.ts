"use server";

import { revalidateTag } from "next/cache";
import { getInsumosByCentro, createInsumos } from "@/lib/api/insumos";
import { ApiError } from "@/lib/api/http";
import type { InsumoItem, InsumosResponse } from "@/lib/api/types";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function fetchInsumosAction(
  centroId: number
): Promise<ActionResult<InsumosResponse>> {
  try {
    return { ok: true, data: await getInsumosByCentro(centroId) };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}

export async function createInsumosAction(
  centro: number,
  insumos: InsumoItem[]
): Promise<ActionResult<InsumosResponse>> {
  try {
    const data = await createInsumos(centro, insumos);
    revalidateTag(`insumos:${centro}`);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}

function toMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 401) return "Iniciá sesión para ver los insumos.";
    if (e.status === 403) return "No estás asignado a este centro.";
  }
  if (e instanceof Error && e.message === "Not authenticated")
    return "Iniciá sesión para ver los insumos.";
  return "Ocurrió un error. Intentá de nuevo.";
}

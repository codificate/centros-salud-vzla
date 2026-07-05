"use server";

import { getTiposInsumos } from "@/lib/api/tiposInsumos";
import type { TipoInsumo } from "@/lib/api/types";

export type TiposInsumosResult =
  | { ok: true; tipos: TipoInsumo[] }
  | { ok: false; error: string };

/** Public supply-type catalog for client components. No auth required. */
export async function fetchTiposInsumosAction(): Promise<TiposInsumosResult> {
  try {
    const { data } = await getTiposInsumos();
    return { ok: true, tipos: data };
  } catch {
    return { ok: false, error: "No se pudieron cargar los tipos de insumos." };
  }
}

/** Plain-array variant for autocompletes. Throws on failure. */
export async function fetchTiposInsumos(): Promise<TipoInsumo[]> {
  const { data } = await getTiposInsumos();
  return data;
}

import "server-only";
import { cache } from "react";
import { apiFetch, ApiError } from "./http";
import { endpoints } from "./config";
import { requireServerToken } from "./auth";
import {
  validateInsumosFilter,
  toInsumosQuery,
  type InsumosFilter,
} from "./insumosFilter";
import type {
  InsumoItem,
  InsumosResponse,
  Paginated,
} from "./types";

/** Supplies for a centro (newest first), optionally filtered. Auth required. */
export const getInsumosByCentro = cache(
  async (
    centroId: number,
    filter: InsumosFilter = {}
  ): Promise<Paginated<InsumosResponse>> => {
    const validation = validateInsumosFilter(filter);
    if (!validation.ok) throw new ApiError(400, validation.error);

    const query = toInsumosQuery(filter);
    const path = query
      ? `${endpoints.insumosByCentro(centroId)}?${query}`
      : endpoints.insumosByCentro(centroId);

    return apiFetch<Paginated<InsumosResponse>>(path, {
      next: { tags: [`insumos:${centroId}`] },
    });
  }
);

/** Register supplies for a centro the user is assigned to. */
export async function createInsumos(
  centro: number,
  insumos: InsumoItem[]
): Promise<Paginated<InsumosResponse>> {
  const token = await requireServerToken();
  return apiFetch<Paginated<InsumosResponse>>(endpoints.insumos, {
    method: "POST",
    token,
    json: { centro, insumos },
  });
}

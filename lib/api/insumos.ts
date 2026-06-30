import "server-only";
import { cache } from "react";
import { apiFetch } from "./http";
import { endpoints } from "./config";
import { requireServerToken } from "./auth";
import type {
  InsumoItem,
  InsumosResponse,
} from "./types";

/** Supplies for a centro (newest first). Auth required. */
export const getInsumosByCentro = cache(
  async (centroId: number): Promise<InsumosResponse> => {
    const token = await requireServerToken();
    return apiFetch<InsumosResponse>(endpoints.insumosByCentro(centroId), {
      token,
      next: { tags: [`insumos:${centroId}`] },
    });
  }
);

/** Register supplies for a centro the user is assigned to. */
export async function createInsumos(
  centro: number,
  insumos: InsumoItem[]
): Promise<InsumosResponse> {
  const token = await requireServerToken();
  return apiFetch<InsumosResponse>(endpoints.insumos, {
    method: "POST",
    token,
    json: { centro, insumos },
  });
}

import "server-only";
import { cache } from "react";
import { apiFetch } from "./http";
import { endpoints } from "./config";
import type { Paginated, TipoInsumo } from "./types";

/** Public catalog of supply types. No token. Cached per request, revalidated hourly. */
export const getTiposInsumos = cache(
  (): Promise<Paginated<TipoInsumo[]>> =>
    apiFetch<Paginated<TipoInsumo[]>>(endpoints.tiposInsumos, {
      next: { revalidate: 3600, tags: ["tipos-insumos"] },
    })
);

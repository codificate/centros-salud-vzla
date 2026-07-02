import "server-only";
import { cache } from "react";
import { apiFetch } from "./http";
import { endpoints } from "./config";
import type { Centro, Paginated } from "./types";

/** Public list of health centers. Cached per request, revalidated hourly. */
export const getCentros = cache(
  (): Promise<Paginated<Centro[]>> =>
    apiFetch<Paginated<Centro[]>>(endpoints.centros, {
      next: { revalidate: 3600, tags: ["centros"] },
    })
);

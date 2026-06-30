"use server";

import { getCentros } from "@/lib/api/centros";
import type { Centro } from "@/lib/api/types";

export async function fetchCentros(): Promise<Centro[]> {
  return getCentros();
}

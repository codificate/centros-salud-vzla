import "server-only";

export interface CedulaVerification {
  nacionalidad: string;
  cedula: string;
  nombre_completo: string;
  meta?: {
    cached?: boolean;
    fetched_at?: string;
    source?: string;
  };
}

/**
 * Validate a cédula against the ve-cedula service.
 * Returns null when the cédula is not found (HTTP 404).
 */
export async function verifyCedula(
  cedula: string,
  nacionalidad: "V" | "E" = "V"
): Promise<CedulaVerification | null> {
  const baseUrl = process.env.NEXT_CEDULA_VE_API_URL?.trim();
  const apiKey = process.env.NEXT_CEDULA_VE_API_KEY?.trim();
  if (!baseUrl || !apiKey)
    throw new Error("ve-cedula service is not configured");

  const url = `${baseUrl.replace(/\/$/, "")}/cedula/${nacionalidad}/${cedula}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 86400 },
  });

  if (res.status === 404) return null;
  if (res.status === 401)
    throw new Error("ve-cedula: invalid API key (NEXT_CEDULA_VE_API_KEY)");
  if (!res.ok) throw new Error(`ve-cedula ${res.status}`);
  return (await res.json()) as CedulaVerification;
}

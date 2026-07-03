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

interface CedulaApiSuccess {
  error: false;
  error_str: false;
  data: {
    nacionalidad: string;
    cedula: number;
    fecha_nac: string;
    rif: string;
    primer_apellido: string;
    segundo_apellido: string;
    primer_nombre: string;
    segundo_nombre: string;
    request_date: string;
  };
}

interface CedulaApiError {
  error: true;
  data: false;
  error_str: string;
}

type CedulaApiResponse = CedulaApiSuccess | CedulaApiError;

/**
 * Validate a cédula against the api.cedula.com.ve service.
 * Returns null when the cédula is not found (RECORD_NOT_FOUND).
 */
export async function verifyCedula(
  cedula: string,
  nacionalidad: "V" | "E" = "V"
): Promise<CedulaVerification | null> {
  const baseUrl = process.env.NEXT_CEDULA_VE_API_URL?.trim();
  const appId = process.env.NEXT_CEDULA_VE_APP_ID?.trim();
  const token = process.env.NEXT_CEDULA_VE_API_TOKEN?.trim();
  if (!baseUrl || !appId || !token)
    throw new Error("cedula.com.ve service is not configured");

  const url = new URL(baseUrl);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("token", token);
  url.searchParams.set("nacionalidad", nacionalidad);
  url.searchParams.set("cedula", cedula);

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`cedula.com.ve ${res.status}`);

  const body = (await res.json()) as CedulaApiResponse;

  if (body.error) {
    if (body.error_str === "RECORD_NOT_FOUND") return null;
    if (body.error_str === "INVALID_TOKEN")
      throw new Error(
        "cedula.com.ve: invalid token (NEXT_CEDULA_VE_API_TOKEN)"
      );
    throw new Error(`cedula.com.ve: ${body.error_str}`);
  }

  const { data } = body;
  const nombre_completo = [
    data.primer_nombre,
    data.segundo_nombre,
    data.primer_apellido,
    data.segundo_apellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    nacionalidad: data.nacionalidad,
    cedula: String(data.cedula),
    nombre_completo,
    meta: {
      fetched_at: data.request_date,
      source: "api.cedula.com.ve",
    },
  };
}

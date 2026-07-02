import "server-only";
import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiRequestInit = Omit<RequestInit, "body"> & {
  token?: string;
  json?: unknown;
};

export async function apiFetch<T>(
  path: string,
  { token, json, headers, ...init }: ApiRequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(json !== undefined && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...(json !== undefined && { body: JSON.stringify(json) }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ApiError(res.status, body.detail ?? "Error desconocido", body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

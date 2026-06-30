import "server-only";

const RAW_BASE =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000";

export const API_BASE_URL = RAW_BASE.replace(/\/$/, "");

export const endpoints = {
  centros: "/api/v1/centros/",
  signUp: "/api/v1/usuarios/sign-up",
  signIn: "/api/v1/usuarios/sign-in",
  insumos: "/api/v1/insumos/",
  insumosByCentro: (centroId: number) => `/api/v1/insumos/by/${centroId}`,
} as const;

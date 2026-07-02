import { NextResponse } from "next/server";
import { getServerToken } from "@/lib/api/auth";
import { extractCedula, type CedulaData } from "@/lib/genai/cedula";
import { verifyCedula, type CedulaVerification } from "@/lib/cedulave/verify";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);

export async function POST(req: Request) {
  const token = await getServerToken();
  if (!token)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  if (!process.env.GEMINI_API_KEY)
    return NextResponse.json(
      { error: "GEMINI_API_KEY no configurada" },
      { status: 500 }
    );

  let body: { image?: string; mimeType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { image, mimeType } = body;
  if (!image || !mimeType || !ALLOWED_TYPES.has(mimeType))
    return NextResponse.json(
      { error: "La imagen debe ser JPEG o PNG" },
      { status: 400 }
    );

  let data: CedulaData;
  try {
    data = await extractCedula(image, mimeType);
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudo procesar la imagen" },
      { status: 502 }
    );
  }

  let verificacion: CedulaVerification | null = null;
  const cedula = data.cedula?.trim();
  if (cedula) {
    try {
      verificacion = await verifyCedula(cedula);
    } catch (error) {
      // Best-effort: keep OCR result even if verification fails.
      console.error("verifyCedula failed:", error);
    }
  }

  return NextResponse.json({ ...data, verificacion });
}

import "server-only";
import {
  GoogleGenerativeAI,
  type GenerativeModel,
} from "@google/generative-ai";

export interface CedulaData {
  cedula: string | null;
  apellidos: string | null;
  nombres: string | null;
  fecha_nacimiento: string | null;
  estado_civil: string | null;
}

const SYSTEM_INSTRUCTION = `
You extract data from images of a Venezuelan Cédula de Identidad.
Do not generate any conversational text, greetings, or explanations.
Your response must be EXCLUSIVELY a valid JSON object.
If a field is illegible due to glare, wear, low resolution, or is cut off in
the image, assign the value null. NEVER invent, deduce, or guess information.
- "cedula": only numbers. Remove prefixes such as "V-", "E-", "V", "E" and any
  thousands separators (dots).
- "apellidos" and "nombres": CAPITAL LETTERS.
- "fecha_nacimiento": format DD/MM/YYYY (convert if necessary).
- "estado_civil": a single capital letter (e.g., S, C, D, V).
`.trim();

const PROMPT = `
Analyze this image of a Venezuelan Cédula de Identidad.
Extract the data and return it using this exact JSON schema:
{
  "cedula": "string (only numbers, remove any V- or E- prefixes and dots)",
  "apellidos": "string (all uppercase)",
  "nombres": "string (all uppercase)",
  "fecha_nacimiento": "string (format DD/MM/YYYY)",
  "estado_civil": "string (e.g., S, C, D, V)"
}
If a specific field is unreadable or obscured by glare, return null for that
field. Do not make up information.
`.trim();

let cachedModel: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (cachedModel) return cachedModel;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  cachedModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
    systemInstruction: SYSTEM_INSTRUCTION,
  });
  return cachedModel;
}

/** OCR a base64 cédula image (jpeg/png) into structured data. */
export async function extractCedula(
  base64: string,
  mimeType: string
): Promise<CedulaData> {
  const result = await getModel().generateContent([
    { text: PROMPT },
    { inlineData: { data: base64, mimeType } },
  ]);
  return JSON.parse(result.response.text()) as CedulaData;
}

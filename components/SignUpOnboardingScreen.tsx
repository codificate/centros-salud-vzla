"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconId } from "@tabler/icons-react";
import { useSignUpFlow } from "@/components/providers/SignUpFlowProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { signUpAction, abortSignUpAction } from "@/app/actions/usuarios";
import { setTokenCookie } from "@/lib/firebase/token";
import ExitConfirmDialog from "@/components/ExitConfirmDialog";
import CentroAutocomplete from "@/components/CentroAutocomplete";

interface CedulaVerification {
  nacionalidad: string;
  cedula: string;
  nombre_completo: string;
}

interface CedulaData {
  cedula: string | null;
  apellidos: string | null;
  nombres: string | null;
  fecha_nacimiento: string | null;
  estado_civil: string | null;
  verificacion?: CedulaVerification | null;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const WHITESPACE = /\s+/;

/**
 * Cross-check the ve-cedula verification against the Gemini OCR result:
 *  - same cédula number, and
 *  - at least one token of the official `nombre_completo` appears in the
 *    OCR nombres/apellidos.
 */
function isCedulaMatch(data: CedulaData): boolean {
  const verification = data.verificacion;
  if (!verification || !data.cedula) return false;
  if (verification.cedula !== data.cedula) return false;

  const ocrNames = `${data.nombres ?? ""} ${data.apellidos ?? ""}`.toUpperCase();
  return verification.nombre_completo
    .toUpperCase()
    .split(WHITESPACE)
    .filter(Boolean)
    .some((token) => ocrNames.includes(token));
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function Spinner() {
  return (
    <svg
      className="h-8 w-8 animate-spin text-sky-700"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export default function SignUpOnboardingScreen() {
  const router = useRouter();
  const { centro, setCentro } = useSignUpFlow();
  const { logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mpps, setMpps] = useState("");
  const [cedula, setCedula] = useState<File | null>(null);
  const [cedulaData, setCedulaData] = useState<CedulaData | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [exitError, setExitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const verified = useMemo(
    () => (cedulaData ? isCedulaMatch(cedulaData) : false),
    [cedulaData]
  );

  // Intercept the browser back button to confirm leaving the flow.
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const onPopState = () => {
      setConfirmExitOpen(true);
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Warn on tab close / reload (native prompt; text is browser-controlled).
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const confirmExit = async () => {
    setExitError(null);
    setExiting(true);
    // DELETE first (needs the token): backend deletes the Firebase user.
    const res = await abortSignUpAction();
    if (!res.ok) {
      setExitError(res.error);
      setExiting(false);
      return;
    }
    // Only after 200: sign out, clear the cookie, leave.
    await logout(); // Firebase signOut
    setTokenCookie(null); // clear the auth token cookie
    router.replace("/");
  };

  const onSelectFile = async (file?: File) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("La imagen debe ser JPEG o PNG.");
      return;
    }
    setFileError(null);
    setCedula(file);
    setCedulaData(null);
    setExtracting(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/cedula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType: file.type }),
      });
      if (!res.ok) throw new Error();
      const response = await res.json()
      setCedulaData((response) as CedulaData);
    } catch {
      setFileError("No se pudo leer la cédula. Probá otra foto.");
    } finally {
      setExtracting(false);
    }
  };

  const submit = () => {
    if (!centro) return;
    setError(null);
    const centroId = centro.id;
    startTransition(async () => {
      const res = await signUpAction(centroId, mpps ? Number(mpps) : 0);
      if (res.ok) router.replace("/dashboard");
      else setError(res.error);
    });
  };

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Continua con tu registro
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {centro?.nombre ?? "Seleccioná tu centro para continuar"}
        </p>
      </header>

      <CentroAutocomplete selectedName={centro?.nombre ?? ""} onPick={setCentro} />

      <div>
        <label
          htmlFor="mpps"
          className="block text-sm font-medium text-slate-700"
        >
          N° MPPS: (opcional)
        </label>
        <input
          id="mpps"
          type="number"
          inputMode="numeric"
          value={mpps}
          onChange={(e) => setMpps(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
        />
      </div>

      <div id="upload-photo-cedula">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => onSelectFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={extracting}
          aria-busy={extracting}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center shadow-sm transition hover:border-sky-300 hover:shadow focus:outline-none focus:ring-2 focus:ring-sky-500/40 disabled:cursor-not-allowed disabled:opacity-80"
        >
          {extracting ? (
            <>
              <Spinner />
              <span className="text-sm font-medium text-slate-700">
                Leyendo cédula…
              </span>
            </>
          ) : (
            <>
              <IconId className="h-8 w-8 text-sky-700" stroke={1.5} aria-hidden />
              <span className="text-sm font-medium text-slate-700">
                Sube foto de tu cédula
              </span>
              {cedula && (
                <span className="max-w-full truncate text-xs text-slate-500">
                  {cedula.name}
                </span>
              )}
            </>
          )}
        </button>
        {fileError && (
          <p className="mt-2 text-sm text-amber-700">{fileError}</p>
        )}
      </div>

      <div id="upload-photo-cedula-disclaimer">
          <span className="text-sm font-medium text-slate-700">
            Nota: Bajo ningún concepto, guardaremos, almacenaremos, o compartiremos con terceros la foto de tu documento de identidad. Entendemos lo importante que es esto para ti, así que por ahora solo necesitamos validar los datos que aparezcan en tu cédula.
          </span>
      </div>

      {cedulaData && (
        <dl className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
          {(
            [
              ["Cédula", cedulaData.cedula],
              ["Apellidos", cedulaData.apellidos],
              ["Nombres", cedulaData.nombres],
              ["Fecha de nacimiento", cedulaData.fecha_nacimiento],
              ["Estado civil", cedulaData.estado_civil],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 py-1">
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-medium text-slate-800">{value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      )}

      {cedulaData?.cedula &&
        (verified ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
            <p className="font-medium text-emerald-800">
              Identidad verificada ✓
            </p>
            <p className="mt-0.5 text-emerald-700">
              {cedulaData.verificacion?.nombre_completo}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            Los datos de la cédula no coinciden con la foto. Probá otra foto.
          </div>
        ))}

      {error && <p className="text-sm text-amber-700">{error}</p>}

      <button
        id="complete-signup-button"
        type="button"
        onClick={submit}
        disabled={isPending || extracting || !verified || !centro}
        className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Registrando…" : "Finalizar registro"}
      </button>

      <ExitConfirmDialog
        open={confirmExitOpen}
        busy={exiting}
        error={exitError}
        onConfirm={confirmExit}
        onCancel={() => {
          if (exiting) return;
          setExitError(null);
          setConfirmExitOpen(false);
        }}
      />
    </main>
  );
}

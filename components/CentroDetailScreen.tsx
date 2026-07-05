"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconFirstAidKit,
  IconUserPlus,
  IconArrowBearRight,
  IconShare,
  IconCheck,
} from "@tabler/icons-react";
import type { Centro } from "@/lib/centros";
import { track } from "@/lib/firebase/analytics";
import Navbar from "@/components/Navbar";
import PublicInsumosByCentro from "@/components/PublicInsumosByCentro";
import SignupGoogleDialog from "@/components/SignupGoogleDialog";
import { useSignupFlow } from "@/components/hooks/useSignupFlow";
import { useAuth } from "@/components/providers/AuthProvider";
import { useIsWideScreen } from "@/lib/screen";

const ACTIONS = [
  { key: "insumos", label: "Ver insumos", Icon: IconFirstAidKit },
  { key: "trabajo", label: "Trabajo ahí", Icon: IconUserPlus },
  { key: "llegar", label: "Cómo llegar", Icon: IconArrowBearRight },
] as const;

const CentroMap = dynamic(() => import("@/components/CentroMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-500">
      Cargando mapa…
    </div>
  ),
});

export default function CentroDetailScreen({ centro }: { centro: Centro }) {
  const router = useRouter();
  const isWide = useIsWideScreen();
  const { user } = useAuth();
  const { askGoogle, busy, error: flowError, start, confirmGoogle, cancelGoogle } =
    useSignupFlow();

  const [copied, setCopied] = useState(false);

  // Hide "trabajo" while a Firebase session is active: signed-in users
  // must not associate a new centro from this route.
  const actions = useMemo(
    () => (user ? ACTIONS.filter(({ key }) => key !== "trabajo") : ACTIONS),
    [user]
  );

  const handleShare = async () => {
    const url = `${window.location.origin}/centro/${centro.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("centro_share", { centro_id: String(centro.id) });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (insecure context / denied permission).
    }
  };

  const handlers: Record<string, () => void> = {
    insumos: () => {
      track("centro_view_insumos", { centro_id: String(centro.id) });
      // Wide: insumos already render in the right column. Small: dedicated route.
      if (!isWide) router.push(`/insumos/centro/${centro.id}`);
    },
    trabajo: () => start(centro),
    llegar: () => {
      const dest = `${centro.geolocalizacion.latitud},${centro.geolocalizacion.longitud}`;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
        "_blank",
        "noopener,noreferrer"
      );
    },
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />

      <main className="flex-1 lg:overflow-hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-1 lg:h-[calc(100dvh-3.5rem)] lg:grid-cols-[minmax(0,28rem)_1fr]">
          {/* Left column — centro detail */}
          <section className="flex min-h-0 flex-col lg:overflow-hidden lg:border-r lg:border-slate-200">
            <div className="relative h-64 w-full shrink-0 border-b border-slate-200 bg-slate-100">
              <CentroMap
                lat={centro.geolocalizacion.latitud}
                lng={centro.geolocalizacion.longitud}
                name={centro.nombre}
              />
              <button
                type="button"
                onClick={handleShare}
                aria-label="Compartir enlace del centro"
                className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              >
                {copied ? (
                  <IconCheck className="h-4 w-4 text-emerald-600" stroke={1.5} aria-hidden />
                ) : (
                  <IconShare className="h-4 w-4 text-sky-700" stroke={1.5} aria-hidden />
                )}
                {copied ? "¡Copiado!" : "Compartir"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">
                    {centro.nombre}
                  </h1>
                  <p className="mt-0.5 text-xs text-slate-500">#{centro.id}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    centro.tipo === "Público"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {centro.tipo}
                </span>
              </div>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Dirección
                  </dt>
                  <dd className="mt-1 text-slate-800">{centro.direccion}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Teléfono
                  </dt>
                  <dd className="mt-1">
                    {centro.telefono ? (
                      <a
                        href={`tel:${centro.telefono.replace(/\s|-/g, "")}`}
                        className="text-sky-700 hover:underline"
                      >
                        {centro.telefono}
                      </a>
                    ) : (
                      <span className="text-slate-400">No disponible</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Geolocalización
                  </dt>
                  <dd className="mt-1 font-mono text-xs text-slate-700">
                    {centro.geolocalizacion.latitud.toFixed(4)},{" "}
                    {centro.geolocalizacion.longitud.toFixed(4)}
                  </dd>
                </div>
              </dl>

              <div
                id="centro-action-buttons"
                className={`mt-4 grid gap-3 ${
                  actions.length === 3 ? "grid-cols-3" : "grid-cols-2"
                }`}
              >
                {actions.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={handlers[key]}
                    disabled={busy}
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-4 text-center shadow-sm transition hover:border-sky-300 hover:shadow focus:outline-none focus:ring-2 focus:ring-sky-500/40 disabled:opacity-60"
                  >
                    <Icon className="h-7 w-7 text-sky-700" stroke={1.5} aria-hidden />
                    <span className="text-xs font-medium text-slate-700">{label}</span>
                  </button>
                ))}
              </div>

              {flowError && (
                <p className="mt-3 text-sm text-amber-700">{flowError}</p>
              )}
            </div>
          </section>

          {/* Right column — insumos (wide screens only) */}
          <section className="hidden min-h-0 flex-col bg-slate-50 lg:flex">
            <div className="border-b border-slate-200 bg-white px-4 py-3">
              <h2 className="truncate text-sm font-semibold text-slate-900">
                Insumos · {centro.nombre}
              </h2>
            </div>
            <div className="min-h-0 flex-1">
              <PublicInsumosByCentro centroId={centro.id} />
            </div>
          </section>
        </div>
      </main>

      <SignupGoogleDialog
        open={askGoogle}
        busy={busy}
        onConfirm={() => confirmGoogle(centro)}
        onCancel={cancelGoogle}
      />
    </div>
  );
}

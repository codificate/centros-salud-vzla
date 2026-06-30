"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  IconFirstAidKit,
  IconUserPlus,
  IconArrowBearRight,
} from "@tabler/icons-react";
import type { Centro } from "@/lib/centros";
import InsumosPanel from "@/components/InsumosPanel";

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

export default function CentroDrawer({
  centro,
  onClose,
}: {
  centro: Centro | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!centro) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [centro, onClose]);

  const open = centro !== null;

  const [showInsumos, setShowInsumos] = useState(false);
  useEffect(() => setShowInsumos(false), [centro?.id]);

  const handlers: Record<string, (() => void) | undefined> = {
    insumos: () => setShowInsumos((v) => !v),
    llegar: centro
      ? () => {
          const dest = `${centro.geolocalizacion.latitud},${centro.geolocalizacion.longitud}`;
          window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
            "_blank",
            "noopener,noreferrer"
          );
        }
      : undefined,
  };

  return (
    <div
      aria-hidden={!open}
      className={`${open ? "pointer-events-auto" : "pointer-events-none"} fixed inset-0 z-[1100]`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${centro?.nombre ?? "centro"}`}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-[40%] min-h-[220px] w-full border-b border-slate-200 bg-slate-100">
          {open && centro && (
            <CentroMap
              lat={centro.geolocalizacion.latitud}
              lng={centro.geolocalizacion.longitud}
              name={centro.nombre}
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {open && centro && (
            <>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {centro.nombre}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    #{centro.id}
                  </p>
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

              <div className="mt-4 grid grid-cols-3 gap-3">
                {ACTIONS.map(({ key, label, Icon }) => {
                  const isInsumos = key === "insumos";
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={handlers[key]}
                      aria-pressed={isInsumos ? showInsumos : undefined}
                      aria-expanded={isInsumos ? showInsumos : undefined}
                      className={`flex flex-col items-center justify-center gap-2 rounded-lg border px-2 py-4 text-center shadow-sm transition hover:border-sky-300 hover:shadow focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${
                        isInsumos && showInsumos
                          ? "border-sky-400 bg-sky-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <Icon className="h-7 w-7 text-sky-700" stroke={1.5} aria-hidden />
                      <span className="text-xs font-medium text-slate-700">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {showInsumos && (
                <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Insumos
                  </h3>
                  <InsumosPanel centroId={centro.id} />
                </section>
              )}
            </>
          )}
        </div>

        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="absolute right-3 top-3 z-10 rounded-md bg-white/90 p-1.5 text-slate-700 shadow hover:bg-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </aside>
    </div>
  );
}

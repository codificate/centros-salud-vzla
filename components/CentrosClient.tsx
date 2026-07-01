"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { IconList, IconMap2 } from "@tabler/icons-react";
import type { Centro } from "@/lib/centros";
import { fetchCentros } from "@/app/actions/centros";
import CentroDrawer from "@/components/CentroDrawer";
import CentrosList from "@/components/CentrosList";
import Navbar from "@/components/Navbar";

const CentrosMap = dynamic(() => import("@/components/CentrosMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-sm text-slate-500">
      Cargando mapa…
    </div>
  ),
});

type View = "list" | "map";

export default function CentrosClient({
  initialCentros = [],
}: {
  initialCentros?: Centro[];
}) {
  const [centros, setCentros] = useState<Centro[]>(initialCentros);
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("list");
  const [active, setActive] = useState<Centro | null>(null);

  useEffect(() => {
    startTransition(async () => {
      setCentros(await fetchCentros());
    });
  }, []);

  const normalized = useMemo(() => query.trim().toLowerCase(), [query]);

  const filtered = useMemo(() => {
    if (!normalized) return centros;
    return centros.filter((c) =>
      [c.nombre, c.tipo, c.direccion, c.telefono]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [centros, normalized]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Centros de Salud
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Venezuela · {centros.length} centros registrados
          </p>
        </header>

        <label htmlFor="search" className="sr-only">
          Buscar centro
        </label>
        <div className="relative mb-4">
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, tipo, dirección o teléfono…"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500" aria-live="polite">
            {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
            {query && ` para "${query}"`}
          </p>

          <div
            role="group"
            aria-label="Cambiar vista"
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm"
          >
            <ViewButton
              active={view === "list"}
              label="Ver lista"
              onClick={() => setView("list")}
            >
              <IconList className="h-4 w-4" stroke={1.5} aria-hidden />
            </ViewButton>
            <ViewButton
              active={view === "map"}
              label="Ver mapa"
              onClick={() => setView("map")}
            >
              <IconMap2 className="h-4 w-4" stroke={1.5} aria-hidden />
            </ViewButton>
          </div>
        </div>

        {view === "map" ? (
          <CentrosMap centros={filtered} onSelect={setActive} />
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            {isPending && centros.length === 0
              ? "Cargando centros…"
              : centros.length === 0
                ? "No hay centros de salud registrados"
                : "Sin resultados"}
          </div>
        ) : (
          <CentrosList centros={filtered} onSelect={setActive} />
        )}
      </main>

      <CentroDrawer centro={active} onClose={() => setActive(null)} />
    </>
  );
}

function ViewButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`rounded-md p-1.5 transition focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${
        active
          ? "bg-sky-600 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

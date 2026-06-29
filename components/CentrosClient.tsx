"use client";

import { useMemo, useState } from "react";
import type { Centro } from "@/lib/centros";
import CentroDrawer from "@/components/CentroDrawer";

export default function CentrosClient({ centros }: { centros: Centro[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Centro | null>(null);

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

        <p className="mb-3 text-xs text-slate-500" aria-live="polite">
          {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
          {query && ` para "${query}"`}
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Sin resultados. Probá otro término.
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setActive(c)}
                  className="block w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-sky-300 hover:shadow focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  aria-haspopup="dialog"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold text-slate-900">
                      {c.nombre}
                    </h2>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.tipo === "Público"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {c.tipo}
                    </span>
                  </div>
                  <dl className="mt-2 space-y-1 text-sm text-slate-600">
                    <div className="flex gap-2">
                      <dt className="w-20 shrink-0 text-slate-500">Dirección</dt>
                      <dd className="truncate">{c.direccion}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-20 shrink-0 text-slate-500">Teléfono</dt>
                      <dd className="text-sky-700">{c.telefono}</dd>
                    </div>
                  </dl>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <CentroDrawer centro={active} onClose={() => setActive(null)} />
    </>
  );
}

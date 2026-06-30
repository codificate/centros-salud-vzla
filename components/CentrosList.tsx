"use client";

import type { Centro } from "@/lib/centros";

export default function CentrosList({
  centros,
  onSelect,
}: {
  centros: Centro[];
  onSelect: (centro: Centro) => void;
}) {
  return (
    <ul className="space-y-3">
      {centros.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onSelect(c)}
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
  );
}

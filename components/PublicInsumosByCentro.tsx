"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { IconFilter, IconSearch, IconX } from "@tabler/icons-react";
import { fetchInsumosAction } from "@/app/actions/insumos";
import CentroInsumoItem from "@/components/CentroInsumoItem";
import type { InsumoResponseItem } from "@/lib/api/types";

const DAY_MS = 86_400_000;

/** `Date` -> `YYYY-MM-DD` for native date inputs. */
function toInputDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
  return toInputDate(new Date(Date.now() - days * DAY_MS));
}

interface DateRange {
  from: string;
  to: string;
}

export default function PublicInsumosByCentro({
  centroId,
}: {
  centroId: number;
}) {
  const [items, setItems] = useState<InsumoResponseItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  // Draft filter (edited in the panel) vs. applied filter (drives the list).
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const [range, setRange] = useState<DateRange | null>(null);

  const today = useMemo(() => toInputDate(new Date()), []);
  const twoMonthsAgo = useMemo(() => daysAgo(60), []);

  useEffect(() => {
    setItems(null);
    setError(null);
    startTransition(async () => {
      const res = await fetchInsumosAction(centroId);
      if (res.ok) setItems(res.data.insumos);
      else setError(res.error);
    });
  }, [centroId]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    const fromT = range?.from ? new Date(range.from).getTime() : null;
    const toT = range?.to ? new Date(`${range.to}T23:59:59`).getTime() : null;

    return items.filter((item) => {
      if (q && !item.descripcion.toLowerCase().includes(q)) return false;
      if (fromT != null || toT != null) {
        const t = new Date(item.create_at).getTime();
        if (Number.isNaN(t)) return false;
        if (fromT != null && t < fromT) return false;
        if (toT != null && t > toT) return false;
      }
      return true;
    });
  }, [items, query, range]);

  const applyPreset = (days: number) => {
    setDraftFrom(daysAgo(days));
    setDraftTo(today);
  };

  const applyFilter = () => {
    if (!draftFrom && !draftTo) return;
    setRange({ from: draftFrom, to: draftTo || today });
    setFilterOpen(false);
  };

  const clearFilter = () => {
    setDraftFrom("");
    setDraftTo("");
    setRange(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-slate-200 p-3">
        <div className="relative min-w-0 flex-1">
          <IconSearch
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar insumo…"
            aria-label="Buscar insumo por descripción"
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          />
        </div>
        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          aria-label="Filtrar por fecha"
          aria-expanded={filterOpen}
          className={`shrink-0 rounded-md border p-2 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${
            filterOpen || range
              ? "border-sky-400 bg-sky-50 text-sky-700"
              : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <IconFilter className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {filterOpen && (
        <div className="border-b border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset(7)}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              1 semana
            </button>
            <button
              type="button"
              onClick={() => applyPreset(14)}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              2 semanas
            </button>
          </div>

          <div className="mt-3 flex items-end gap-2">
            <label className="flex-1 text-xs font-medium text-slate-500">
              Desde
              <input
                type="date"
                value={draftFrom}
                min={twoMonthsAgo}
                max={today}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </label>
            <label className="flex-1 text-xs font-medium text-slate-500">
              Hasta
              <input
                type="date"
                value={draftTo}
                min={draftFrom || twoMonthsAgo}
                max={today}
                onChange={(e) => setDraftTo(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </label>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={clearFilter}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              Limpiar filtro
            </button>
            <button
              type="button"
              onClick={applyFilter}
              disabled={!draftFrom && !draftTo}
              className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Aplicar filtro
            </button>
          </div>
        </div>
      )}

      {range && (
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 py-1.5">
          <span className="text-xs text-slate-500">
            {range.from || "…"} → {range.to}
          </span>
          <button
            type="button"
            onClick={clearFilter}
            aria-label="Quitar filtro de fecha"
            className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <IconX className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3">
        <p className="py-4 text-sm text-slate-500">Se necesitan los siguientes insumos:</p>
        {pending && !items ? (
          <p className="py-4 text-sm text-slate-500">Cargando insumos…</p>
        ) : error ? (
          <p className="py-4 text-sm text-amber-700">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="py-4 text-sm text-slate-500">
            {items?.length ? "Sin resultados para el filtro." : "Sin insumos registrados."}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((insumo, i) => (
              <li key={`${insumo.descripcion}-${insumo.create_at}-${i}`}>
                <CentroInsumoItem insumo={insumo} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

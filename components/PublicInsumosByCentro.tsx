"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { IconFilter, IconSearch, IconX } from "@tabler/icons-react";
import { fetchInsumosAction } from "@/app/actions/insumos";
import {
  validateInsumosFilter,
  type InsumosFilter,
} from "@/lib/api/insumosFilter";
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

/** Native date input value `YYYY-MM-DD` -> API `DD-MM-YYYY`. */
function toApiDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

function describeFilter(filter: InsumosFilter): string {
  if (filter.semanas !== undefined)
    return `Últimas ${filter.semanas} ${
      filter.semanas === 1 ? "semana" : "semanas"
    }`;
  return `${filter.desde ?? "…"} → ${filter.hasta ?? "hoy"}`;
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

  // Draft dates (edited in the panel) vs. applied filter (drives the fetch).
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const [filter, setFilter] = useState<InsumosFilter | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);

  const today = useMemo(() => toInputDate(new Date()), []);
  const twoMonthsAgo = useMemo(() => daysAgo(60), []);

  // Server-side filtering: refetch whenever the centro or applied filter changes.
  useEffect(() => {
    setItems(null);
    setError(null);
    startTransition(async () => {
      const res = await fetchInsumosAction(centroId, filter ?? undefined);
      if (res.ok) setItems(res.data.insumos);
      else setError(res.error);
    });
  }, [centroId, filter]);

  // Text search stays client-side over the already-filtered result.
  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.descripcion.toLowerCase().includes(q));
  }, [items, query]);

  const applyPreset = (semanas: number) => {
    setDraftFrom("");
    setDraftTo("");
    setFilterError(null);
    setFilter({ semanas });
    setFilterOpen(false);
  };

  const applyRange = () => {
    const next: InsumosFilter = {
      desde: draftFrom ? toApiDate(draftFrom) : undefined,
      hasta: draftTo ? toApiDate(draftTo) : undefined,
    };
    const validation = validateInsumosFilter(next);
    if (!validation.ok) {
      setFilterError(validation.error);
      return;
    }
    setFilterError(null);
    setFilter(next);
    setFilterOpen(false);
  };

  const clearFilter = () => {
    setDraftFrom("");
    setDraftTo("");
    setFilterError(null);
    setFilter(null);
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
            filterOpen || filter
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
              onClick={() => applyPreset(1)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${
                filter?.semanas === 1
                  ? "border-sky-400 bg-sky-100 text-sky-700"
                  : "border-slate-300 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700"
              }`}
            >
              1 semana
            </button>
            <button
              type="button"
              onClick={() => applyPreset(2)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${
                filter?.semanas === 2
                  ? "border-sky-400 bg-sky-100 text-sky-700"
                  : "border-slate-300 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700"
              }`}
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

          {filterError && (
            <p className="mt-2 text-xs font-medium text-red-600" role="alert">
              {filterError}
            </p>
          )}

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
              onClick={applyRange}
              disabled={!draftFrom && !draftTo}
              className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Aplicar filtro
            </button>
          </div>
        </div>
      )}

      {filter && (
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 py-1.5">
          <span className="text-xs text-slate-500">{describeFilter(filter)}</span>
          <button
            type="button"
            onClick={clearFilter}
            aria-label="Quitar filtro"
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
                <CentroInsumoItem insumo={insumo} public />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

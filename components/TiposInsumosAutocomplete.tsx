"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchTiposInsumos } from "@/app/actions/tiposInsumos";
import InsumoPriorityBadge from "@/components/InsumoPriorityBadge";
import type { TipoInsumo } from "@/lib/api/types";

// Module-level cache: fetch the catalog once per session, reuse across mounts.
let catalogCache: Promise<TipoInsumo[]> | null = null;
function loadCatalog(): Promise<TipoInsumo[]> {
  if (!catalogCache) {
    catalogCache = fetchTiposInsumos().catch((e) => {
      catalogCache = null; // allow retry on next mount
      throw e;
    });
  }
  return catalogCache;
}

export default function TiposInsumosAutocomplete({
  value = "",
  disabled = false,
  onPick,
}: {
  value?: string;
  disabled?: boolean;
  onPick: (tipo: TipoInsumo) => void;
}) {
  const [tipos, setTipos] = useState<TipoInsumo[]>([]);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    let active = true;
    loadCatalog()
      .then((list) => {
        if (active) setTipos(list);
      })
      .catch(() => {
        if (active) setTipos([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const handlePick = useCallback(
    (tipo: TipoInsumo) => {
      onPick(tipo);
      setQuery(tipo.nombre);
      setOpen(false);
      inputRef.current?.blur();
    },
    [onPick],
  );

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tipos
      .filter(
        (t) =>
          t.nombre.toLowerCase().includes(q) ||
          t.categoria.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [tipos, query]);

  return (
    <div className="relative min-w-0 flex-1">
      <input
        ref={inputRef}
        id="insumo-descripcion"
        type="text"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-autocomplete="list"
        aria-label="Tipo de insumo"
        autoComplete="off"
        disabled={disabled}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder="Buscar tipo de insumo…"
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:bg-slate-50"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {suggestions.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handlePick(t)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-slate-900">
                    {t.nombre}
                  </span>
                  <InsumoPriorityBadge prioridad={t.prioridad} />
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">
                  {t.categoria} · {t.unidad_medida}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

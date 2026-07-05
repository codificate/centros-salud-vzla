"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchCentros } from "@/app/actions/centros";
import type { Centro } from "@/lib/centros";
import { track } from "@/lib/firebase/analytics";

export default function CentroAutocomplete({
  selectedName = "",
  onPick,
}: {
  selectedName?: string;
  onPick: (centro: Centro) => void;
}) {
  const [centros, setCentros] = useState<Centro[]>([]);
  const [query, setQuery] = useState(selectedName);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCentros()
      .then(setCentros)
      .catch(() => setCentros([]));
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (!term) return;
    const id = setTimeout(() => {
      track("search", { search_term: term, context: "centro_autocomplete" });
    }, 400);
    return () => clearTimeout(id);
  }, [query]);

  const handlePick = useCallback(
    (centro: Centro) => {
      track("centro_select", { centro_id: String(centro.id), source: "autocomplete" });
      onPick(centro);
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();
    },
    [onPick],
  );

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return centros
      .filter((c) => c.nombre.toLowerCase().includes(q))
      .slice(0, 8);
  }, [centros, query]);

  return (
    <div className="relative">
      <label
        htmlFor="centro-search"
        className="block text-sm font-medium text-slate-700"
      >
        Centro
      </label>
      <input
        ref={inputRef}
        id="centro-search"
        type="text"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-autocomplete="list"
        autoComplete="off"
        value={query}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Busca tu centro…"
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {suggestions.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handlePick(c)}
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
              >
                <span className="font-medium text-slate-900">{c.nombre}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">
                  {c.direccion}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

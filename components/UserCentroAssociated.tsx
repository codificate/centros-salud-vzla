"use client";

import { useState } from "react";
import { IconDots, IconTrash } from "@tabler/icons-react";
import type { Centro } from "@/lib/api/types";

export default function UserCentroAssociated({
  centro,
  selected = false,
  removing = false,
  onSelect,
  onRemove,
}: {
  centro: Centro;
  selected?: boolean;
  removing?: boolean;
  onSelect?: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`group relative rounded-md border transition ${
        selected
          ? "border-sky-200 bg-sky-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect?.(centro.id)}
        aria-pressed={selected}
        className="block w-full rounded-md px-3 py-2.5 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-sky-500/40"
      >
        <span
          className={`block truncate text-sm font-medium ${
            selected ? "text-sky-900" : "text-slate-900"
          }`}
        >
          {centro.nombre}
        </span>
        <span className="mt-0.5 block truncate text-xs text-slate-500">
          {centro.direccion}
        </span>
      </button>

      <div className="absolute right-2 top-2 flex items-center gap-1">
        {menuOpen ? (
          <button
            type="button"
            onClick={() => onRemove(centro.id)}
            disabled={removing}
            aria-label={`Quitar ${centro.nombre}`}
            className="rounded-md p-1.5 text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:opacity-50"
          >
            <IconTrash className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Opciones del centro"
          aria-expanded={menuOpen}
          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          <IconDots className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

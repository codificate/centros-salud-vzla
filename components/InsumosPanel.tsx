"use client";

import { useEffect, useState, useTransition } from "react";
import { fetchInsumosAction } from "@/app/actions/insumos";
import type { InsumoResponseItem } from "@/lib/api/types";

export default function InsumosPanel({ centroId }: { centroId: number }) {
  const [items, setItems] = useState<InsumoResponseItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setItems(null);
    setError(null);
    startTransition(async () => {
      const res = await fetchInsumosAction(centroId);
      if (res.ok) setItems(res.data.insumos);
      else setError(res.error);
    });
  }, [centroId]);

  if (pending && !items) {
    return <p className="py-3 text-sm text-slate-500">Cargando insumos…</p>;
  }

  if (error) {
    return <p className="py-3 text-sm text-amber-700">{error}</p>;
  }

  if (!items?.length) {
    return (
      <p className="py-3 text-sm text-slate-500">Sin insumos registrados.</p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((insumo, i) => (
        <li key={i} className="flex items-center justify-between gap-3 py-2">
          <span className="text-sm text-slate-800">{insumo.descripcion}</span>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
            {insumo.cantidad}
          </span>
        </li>
      ))}
    </ul>
  );
}

import type { InsumoResponseItem } from "@/lib/api/types";

const DATE_FMT = new Intl.DateTimeFormat("es-VE", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : DATE_FMT.format(date);
}

export default function CentroInsumoItem({
  insumo,
}: {
  insumo: InsumoResponseItem;
}) {
  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-medium text-slate-800">
          {insumo.descripcion}
        </span>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {insumo.cantidad}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-slate-500">
        {insumo.created_by} · {formatDate(insumo.create_at)}
      </p>
    </div>
  );
}

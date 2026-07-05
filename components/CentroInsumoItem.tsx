import InsumoPriorityBadge from "@/components/InsumoPriorityBadge";
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
  public: isPublic = false,
}: {
  insumo: InsumoResponseItem;
  public?: boolean;
}) {
  return (
    <div className="py-2.5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium text-slate-800">
            {insumo.descripcion}
          </span>
          <InsumoPriorityBadge prioridad={insumo.prioridad} />
        </span>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {insumo.cantidad}
        </span>
      </div>
      {(insumo.categoria || insumo.unidad_medida) && (
        <div className="mt-0.5 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span className="truncate">{insumo.categoria}</span>
          <span className="shrink-0">{insumo.unidad_medida}</span>
        </div>
      )}
      <p className="mt-0.5 text-xs text-slate-500">
        {isPublic
          ? `Publicado: ${formatDate(insumo.create_at)}`
          : `${insumo.created_by} · Publicado: ${formatDate(insumo.create_at)}`}
      </p>
    </div>
  );
}

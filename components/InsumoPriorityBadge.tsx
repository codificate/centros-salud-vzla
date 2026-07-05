const PRIORITY_STYLES: Record<string, string> = {
  critica: "bg-red-100 text-red-700",
  alta: "bg-orange-100 text-orange-700",
  media: "bg-amber-100 text-amber-700",
  baja: "bg-slate-100 text-slate-600",
};

/** Normalize accents/case so "Crítica" and "critica" map to the same style. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export default function InsumoPriorityBadge({
  prioridad,
}: {
  prioridad?: string;
}) {
  if (!prioridad) return null;
  const style = PRIORITY_STYLES[normalize(prioridad)] ?? "bg-slate-100 text-slate-600";
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${style}`}
    >
      {prioridad}
    </span>
  );
}

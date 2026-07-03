import Link from "next/link";
import { notFound } from "next/navigation";
import PublicInsumosByCentro from "@/components/PublicInsumosByCentro";

export default function CentroInsumosPage({
  params,
}: {
  params: { centroId: string };
}) {
  const centroId = Number(params.centroId);
  if (!Number.isInteger(centroId) || centroId <= 0) notFound();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
        <Link
          href="/"
          className="rounded-md px-2 py-1 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          ← Volver
        </Link>
        <h1 className="text-base font-semibold text-slate-900">Insumos</h1>
      </header>
      <div className="flex-1">
        <PublicInsumosByCentro centroId={centroId} />
      </div>
    </main>
  );
}

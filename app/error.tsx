"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center">
      <h2 className="text-lg font-semibold text-slate-900">
        No se pudieron cargar los centros
      </h2>
      <p className="text-sm text-slate-600">
        Revisá tu conexión e intentá de nuevo.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Reintentar
      </button>
    </main>
  );
}

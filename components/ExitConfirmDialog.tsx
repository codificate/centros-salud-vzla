"use client";

import { createPortal } from "react-dom";

export default function ExitConfirmDialog({
  open,
  busy,
  error,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label="Salir del registro"
        className="relative w-full max-w-sm rounded-lg bg-white p-5 shadow-xl"
      >
        <h3 className="text-base font-semibold text-slate-900">
          Salir del registro
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Estás seguro de querer salir del registro
        </p>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {busy ? "Saliendo…" : "Sí"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

"use client";

import { createPortal } from "react-dom";

interface ExitConfirmDialogProps {
  open: boolean;
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  busyLabel?: string;
  cancelLabel?: string;
  /** When false, the cancel button is disabled while `busy`. */
  cancelDisabledWhileBusy?: boolean;
}

export default function ExitConfirmDialog({
  open,
  busy,
  error,
  onConfirm,
  onCancel,
  title = "Salir del registro",
  message = "Estás seguro de querer salir del registro",
  confirmLabel = "Sí",
  busyLabel = "Saliendo…",
  cancelLabel = "No",
  cancelDisabledWhileBusy = true,
}: ExitConfirmDialogProps) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm rounded-lg bg-white p-5 shadow-xl"
      >
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={cancelDisabledWhileBusy && busy}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

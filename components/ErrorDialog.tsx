"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { IconAlertTriangle } from "@tabler/icons-react";

interface ErrorDialogProps {
  open: boolean;
  title?: string;
  message: string | null;
  onClose: () => void;
}

export default function ErrorDialog({
  open,
  title = "Algo salió mal",
  message,
  onClose,
}: ErrorDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-message"
        className="relative w-full max-w-sm rounded-lg bg-white p-5 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
            <IconAlertTriangle
              className="h-5 w-5 text-red-600"
              stroke={1.8}
              aria-hidden
            />
          </span>
          <div className="min-w-0">
            <h3
              id="error-dialog-title"
              className="text-base font-semibold text-slate-900"
            >
              {title}
            </h3>
            {message && (
              <p
                id="error-dialog-message"
                className="mt-1 text-sm text-slate-600"
              >
                {message}
              </p>
            )}
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

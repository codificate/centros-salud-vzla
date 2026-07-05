"use client";

import { createPortal } from "react-dom";

export default function SignupGoogleDialog({
  open,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  busy: boolean;
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
        aria-label="Crear cuenta"
        className="relative w-full max-w-sm rounded-lg bg-white p-5 shadow-xl"
      >
        <h3 className="text-base font-semibold text-slate-900">Registrate</h3>
        <p className="mt-2 text-sm text-slate-600">
          Crea tu cuenta
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            id="google-button"
            type="button"
            onClick={onConfirm}
            disabled={busy}
            style={{
              height: 48,
              paddingLeft: 12,
              paddingRight: 12,
              backgroundColor: "#F2F2F2",
              color: "#1F1F1F",
              fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: "20px",
            }}
            className="inline-flex items-center rounded-full border-0 transition hover:brightness-95 disabled:opacity-60"
          >
            <img
              src="/google-icon-neutral.svg"
              alt=""
              aria-hidden
              width={48}
              height={48}
              style={{ marginRight: 10 }}
            />
            Continuar con Google
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

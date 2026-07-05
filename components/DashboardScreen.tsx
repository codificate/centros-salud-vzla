"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import Navbar from "@/components/Navbar";
import CentroAutocomplete from "@/components/CentroAutocomplete";
import TiposInsumosAutocomplete from "@/components/TiposInsumosAutocomplete";
import UserCentroAssociated from "@/components/UserCentroAssociated";
import CentroInsumoItem from "@/components/CentroInsumoItem";
import ErrorDialog from "@/components/ErrorDialog";
import { distanceKm } from "@/lib/geo";
import {
  listUserCentrosAction,
  addCentroAction,
  removeCentroAction,
} from "@/app/actions/usuarios";
import {
  fetchInsumosAction,
  createInsumosAction,
} from "@/app/actions/insumos";
import type {
  Centro,
  InsumoItem,
  InsumoResponseItem,
  TipoInsumo,
} from "@/lib/api/types";

interface CentroUser {
  nombre: string;
  mpps?: number;
}

const MAX_CENTRO_DISTANCE_KM = 100;

export default function DashboardScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Protect the route by the current Firebase session.
  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  const [associated, setAssociated] = useState<Centro[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [insumos, setInsumos] = useState<InsumoResponseItem[]>([]);
  const [insumosLoading, setInsumosLoading] = useState(false);
  const [addingInsumo, startInsumoTransition] = useTransition();
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    listUserCentrosAction().then((r) => {
      if (r.ok) setAssociated(r.centros);
    });
  }, []);

  const selectedCentro = useMemo(
    () => associated.find((c) => c.id === selectedId) ?? associated[0] ?? null,
    [associated, selectedId],
  );

  const selectedCentroId = selectedCentro?.id ?? null;

  // Load insumos for the first/selected centro; server-cached per centro.
  useEffect(() => {
    if (selectedCentroId == null) {
      setInsumos([]);
      return;
    }
    let active = true;
    setInsumosLoading(true);
    fetchInsumosAction(selectedCentroId)
      .then((r) => {
        if (active) setInsumos(r.ok ? r.data.insumos : []);
      })
      .finally(() => {
        if (active) setInsumosLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedCentroId]);

  const handleAddInsumo = useCallback(
    (item: InsumoItem) => {
      if (selectedCentroId == null) return;
      startInsumoTransition(async () => {
        const r = await createInsumosAction(selectedCentroId, [item]);
        if (r.ok) setInsumos(r.data.insumos);
      });
    },
    [selectedCentroId],
  );

  const handleAdd = useCallback(
    (centro: Centro) => {
      if (associated.some((c) => c.id === centro.id)) return;

      // New centro must be within 100 km of the first associated one.
      const first = associated[0];
      if (first && centro.geolocalizacion && first.geolocalizacion) {
        const km = distanceKm(first.geolocalizacion, centro.geolocalizacion);
        if (km > MAX_CENTRO_DISTANCE_KM) {
          setAddError(
            `«${centro.nombre}» está a ${Math.round(km)} km de «${first.nombre}». Solo puedes asociar centros a menos de ${MAX_CENTRO_DISTANCE_KM} km del primer centro que asociaste.`,
          );
          return;
        }
      }

      startTransition(async () => {
        const r = await addCentroAction(centro.id);
        if (r.ok) setAssociated(r.centros);
      });
    },
    [associated],
  );

  const handleRemove = useCallback((id: number) => {
    setRemovingId(id);
    startTransition(async () => {
      const r = await removeCentroAction(id);
      if (r.ok) setAssociated(r.centros);
      setRemovingId(null);
    });
  }, []);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        Cargando…
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Panel
          </h1>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CentrosColumn
            centros={associated}
            selectedId={selectedCentro?.id ?? null}
            onSelect={setSelectedId}
            onAdd={handleAdd}
            onRemove={handleRemove}
            removingId={removingId}
            busy={isPending}
          />
          <InsumosColumn
            centro={selectedCentro}
            insumos={insumos}
            loading={insumosLoading}
            submitting={addingInsumo}
            onAdd={handleAddInsumo}
          />
        </div>
      </main>

      <ErrorDialog
        open={addError !== null}
        title="No se pudo asociar el centro"
        message={addError}
        onClose={() => setAddError(null)}
      />
    </>
  );
}

function Column({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
        {title}
      </h2>
      <div className="flex-1 p-3">{children}</div>
    </section>
  );
}

function CentrosColumn({
  centros,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
  removingId,
  busy,
}: {
  centros: Centro[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAdd: (centro: Centro) => void;
  onRemove: (id: number) => void;
  removingId: number | null;
  busy: boolean;
}) {
  return (
    <Column title="Mis centros">
      <div className="mb-3">
        <CentroAutocomplete onPick={onAdd} />
      </div>
      {centros.length === 0 ? (
        <p className="px-1 py-4 text-sm text-slate-500">
          Buscá un centro para asociarlo.
        </p>
      ) : (
        <ul className="space-y-1.5" aria-busy={busy}>
          {centros.map((c) => (
            <li key={c.id}>
              <UserCentroAssociated
                centro={c}
                selected={c.id === selectedId}
                removing={removingId === c.id}
                onSelect={onSelect}
                onRemove={onRemove}
              />
            </li>
          ))}
        </ul>
      )}
    </Column>
  );
}

function InsumosColumn({
  centro,
  insumos,
  loading,
  submitting,
  onAdd,
}: {
  centro: Centro | null;
  insumos: InsumoResponseItem[];
  loading: boolean;
  submitting: boolean;
  onAdd: (item: InsumoItem) => void;
}) {
  const [tipo, setTipo] = useState<TipoInsumo | null>(null);
  const [cantidad, setCantidad] = useState("");

  const qty = Number(cantidad);
  const isValid = tipo != null && Number.isFinite(qty) && qty > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting || !tipo) return;
    onAdd({
      descripcion: tipo.nombre,
      cantidad: qty,
      tipo_id: tipo.id,
      categoria: tipo.categoria,
      prioridad: tipo.prioridad,
      unidad_medida: tipo.unidad_medida,
    });
    setTipo(null);
    setCantidad("");
  };

  return (
    <Column title={centro ? `Insumos · ${centro.nombre}` : "Insumos"}>
      <form onSubmit={submit} className="mb-3 flex gap-2">
        <TiposInsumosAutocomplete
          value={tipo?.nombre ?? ""}
          disabled={!centro || submitting}
          onPick={setTipo}
        />
        <input
          type="number"
          min={1}
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          placeholder="Cant."
          aria-label="Cantidad"
          disabled={!centro || submitting}
          className="w-20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:bg-slate-50"
        />
        <button
          id="add-insumo"
          type="submit"
          disabled={!isValid || submitting}
          className="shrink-0 rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "Añadiendo…" : "Añadir"}
        </button>
      </form>
      {!centro ? (
        <p className="px-1 py-4 text-sm text-slate-500">
          Elegí un centro para ver sus insumos.
        </p>
      ) : loading ? (
        <p className="px-1 py-4 text-sm text-slate-500">Cargando insumos…</p>
      ) : insumos.length === 0 ? (
        <p className="px-1 py-4 text-sm text-slate-500">
          Sin insumos. Añadí el primero.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100" aria-busy={submitting}>
          {insumos.map((insumo, i) => (
            <li key={`${insumo.descripcion}-${insumo.create_at}-${i}`}>
              <CentroInsumoItem insumo={insumo} />
            </li>
          ))}
        </ul>
      )}
    </Column>
  );
}

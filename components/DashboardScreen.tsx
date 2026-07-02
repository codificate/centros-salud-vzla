"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import Navbar from "@/components/Navbar";
import type { Centro } from "@/lib/api/types";

interface Insumo {
  descripcion: string;
  cantidad: number;
}

interface CentroUser {
  nombre: string;
  mpps?: number;
}

// TODO: replace mock data with API calls (centros/insumos/usuarios).
const MOCK_CENTROS: Centro[] = [
  {
    id: 1,
    nombre: "Hospital Universitario de Caracas",
    tipo: "Público",
    direccion: "Ciudad Universitaria, Caracas",
    telefono: "0212-6053111",
    geolocalizacion: { latitud: 10.49, longitud: -66.89 },
  },
  {
    id: 2,
    nombre: "Centro Médico Docente La Trinidad",
    tipo: "Privado",
    direccion: "La Trinidad, Caracas",
    telefono: "0212-9496411",
    geolocalizacion: { latitud: 10.42, longitud: -66.84 },
  },
];

const MOCK_INSUMOS: Insumo[] = [
  { descripcion: "Guantes quirúrgicos", cantidad: 120 },
  { descripcion: "Jeringas 5ml", cantidad: 300 },
];

const MOCK_USERS: CentroUser[] = [
  { nombre: "María Rodríguez", mpps: 12345 },
  { nombre: "José Pérez", mpps: 67890 },
];

const NORMALIZE = (value: string) => value.trim().toLowerCase();

export default function DashboardScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Protect the route by the current Firebase session.
  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  const [centros] = useState<Centro[]>(MOCK_CENTROS);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(
    MOCK_CENTROS[0]?.id ?? null,
  );
  const [insumos, setInsumos] = useState<Insumo[]>(MOCK_INSUMOS);
  const [users] = useState<CentroUser[]>(MOCK_USERS);

  const filteredCentros = useMemo(() => {
    const q = NORMALIZE(query);
    if (!q) return centros;
    return centros.filter((c) => NORMALIZE(c.nombre).includes(q));
  }, [centros, query]);

  const selectedCentro = useMemo(
    () => centros.find((c) => c.id === selectedId) ?? null,
    [centros, selectedId],
  );

  const addInsumo = useCallback((insumo: Insumo) => {
    setInsumos((prev) => [insumo, ...prev]);
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

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <CentrosColumn
            centros={filteredCentros}
            query={query}
            onQueryChange={setQuery}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <InsumosColumn
            centro={selectedCentro}
            insumos={insumos}
            onAdd={addInsumo}
          />
          <UsersColumn centro={selectedCentro} users={users} />
        </div>
      </main>
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
  query,
  onQueryChange,
  selectedId,
  onSelect,
}: {
  centros: Centro[];
  query: string;
  onQueryChange: (value: string) => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <Column title="Mis centros">
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Buscar centro…"
        aria-label="Buscar centro"
        className="mb-3 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
      />
      {centros.length === 0 ? (
        <p className="px-1 py-4 text-sm text-slate-500">Sin centros.</p>
      ) : (
        <ul className="space-y-1">
          {centros.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                aria-pressed={c.id === selectedId}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${
                  c.id === selectedId
                    ? "bg-sky-50 font-medium text-sky-900"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {c.nombre}
              </button>
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
  onAdd,
}: {
  centro: Centro | null;
  insumos: Insumo[];
  onAdd: (insumo: Insumo) => void;
}) {
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const desc = descripcion.trim();
    const qty = Number(cantidad);
    if (!desc || !Number.isFinite(qty) || qty <= 0) return;
    onAdd({ descripcion: desc, cantidad: qty });
    setDescripcion("");
    setCantidad("");
  };

  return (
    <Column title={centro ? `Insumos · ${centro.nombre}` : "Insumos"}>
      <form onSubmit={submit} className="mb-3 flex gap-2">
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción"
          aria-label="Descripción del insumo"
          className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
        />
        <input
          type="number"
          min={1}
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          placeholder="Cant."
          aria-label="Cantidad"
          className="w-20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          Añadir
        </button>
      </form>
      {insumos.length === 0 ? (
        <p className="px-1 py-4 text-sm text-slate-500">Sin insumos.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {insumos.map((insumo, i) => (
            <li
              key={`${insumo.descripcion}-${i}`}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <span className="text-slate-800">{insumo.descripcion}</span>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                {insumo.cantidad}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Column>
  );
}

function UsersColumn({
  centro,
  users,
}: {
  centro: Centro | null;
  users: CentroUser[];
}) {
  return (
    <Column title={centro ? `Personal · ${centro.nombre}` : "Personal"}>
      {users.length === 0 ? (
        <p className="px-1 py-4 text-sm text-slate-500">Sin personal.</p>
      ) : (
        <ul className="space-y-1">
          {users.map((u, i) => (
            <li
              key={`${u.nombre}-${i}`}
              className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm hover:bg-slate-50"
            >
              <span className="text-slate-800">{u.nombre}</span>
              {u.mpps != null && (
                <span className="shrink-0 text-xs text-slate-500">
                  MPPS {u.mpps}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Column>
  );
}

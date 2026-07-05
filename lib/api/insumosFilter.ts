/**
 * Insumos filter — shared by the server data layer and client UI.
 * Two mutually exclusive modes:
 *   - `semanas`: last N weeks (integer, 1 or 2)
 *   - `desde`/`hasta`: DD-MM-YYYY range, at most 2 months back, never future
 */
export interface InsumosFilter {
  semanas?: number;
  /** From date, `DD-MM-YYYY`. */
  desde?: string;
  /** Until date, `DD-MM-YYYY`. Empty means "until now". */
  hasta?: string;
}

export type FilterValidation = { ok: true } | { ok: false; error: string };

const DDMMYYYY = /^(\d{2})-(\d{2})-(\d{4})$/;
const MAX_SEMANAS = 2;
const RANGE_MONTHS = 2;

/** Parse `DD-MM-YYYY` to a local-midnight Date, rejecting overflow dates. */
function parseDdMmYyyy(value: string): Date | null {
  const match = DDMMYYYY.exec(value);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return null;
  return date;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function monthsBefore(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

export function validateInsumosFilter(filter: InsumosFilter): FilterValidation {
  const { semanas, desde, hasta } = filter;

  if (semanas !== undefined) {
    if (!Number.isInteger(semanas) || semanas <= 0 || semanas > MAX_SEMANAS)
      return { ok: false, error: "Las semanas deben ser 1 o 2." };
    return { ok: true };
  }

  if (!desde && !hasta) return { ok: true };

  const today = startOfToday();
  const earliest = monthsBefore(today, RANGE_MONTHS);

  const from = desde ? parseDdMmYyyy(desde) : null;
  if (desde && !from)
    return { ok: false, error: "«Desde» debe tener formato DD-MM-YYYY." };

  const to = hasta ? parseDdMmYyyy(hasta) : today;
  if (hasta && !to)
    return { ok: false, error: "«Hasta» debe tener formato DD-MM-YYYY." };

  if (from && from > today)
    return { ok: false, error: "«Desde» no puede ser una fecha futura." };
  if (to && to > today)
    return { ok: false, error: "«Hasta» no puede ser una fecha futura." };
  if (from && from < earliest)
    return { ok: false, error: "«Desde» no puede superar los 2 meses." };
  if (from && to && from > to)
    return { ok: false, error: "«Desde» debe ser anterior a «Hasta»." };

  return { ok: true };
}

/** Serialize a validated filter to a query string (no leading `?`). */
export function toInsumosQuery(filter: InsumosFilter): string {
  const params = new URLSearchParams();
  if (filter.semanas !== undefined) {
    params.set("semanas", String(filter.semanas));
  } else {
    if (filter.desde) params.set("desde", filter.desde);
    if (filter.hasta) params.set("hasta", filter.hasta);
  }
  return params.toString();
}

export interface Pagination {
  current_page: number;
  next_page: number;
  items_per_page: number;
  pages: number;
}

/** Envelope wrapping every paginated backend response. */
export interface Paginated<T> {
  data: T;
  pagination: Pagination;
}

export interface Geolocalizacion {
  latitud: number;
  longitud: number;
}

export interface Centro {
  id: number;
  nombre: string;
  tipo: string;
  direccion: string;
  geolocalizacion: Geolocalizacion;
  telefono?: string | null;
}

/** Catalog entry from the public `tipos-insumos` endpoint. */
export interface TipoInsumo {
  id: string;
  nombre: string;
  categoria: string;
  prioridad: string;
  unidad_medida: string;
}

export interface InsumoItem {
  cantidad: number;
  descripcion: string;
  /** Selected catalog type (from `tipos-insumos`). */
  tipo_id?: string;
  categoria?: string;
  prioridad?: string;
  unidad_medida?: string;
}

export interface InsumoResponseItem extends InsumoItem {
  create_at: string;
  created_by: string
}

export interface InsumosCreateRequest {
  centro: number;
  insumos: InsumoItem[];
}

export interface InsumosResponse {
  insumos: InsumoResponseItem[];
}

export interface SignUpRequest {
  centro_id: number;
  mpps: number;
  cedula: string;
}

export interface UserResponse {
  nombre: string;
  mpps: number;
  centros: Centro[];
}

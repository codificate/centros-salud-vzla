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

export interface InsumoItem {
  cantidad: number;
  descripcion: string;
}

export interface InsumoResponseItem extends InsumoItem {
  create_at: string;
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
}

export interface UserResponse {
  nombre: string;
  mpps: number;
  centros: Centro[];
}

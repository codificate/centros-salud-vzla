interface Geo {
  latitud: number;
  longitud: number;
}

export interface Centro {
  id: number;
  nombre: string;
  tipo: string;
  direccion: string;
  geolocalizacion: Geo;
  telefono: string;
}

import rawCentros from "@/centros.json";

export const centros: Centro[] = rawCentros as Centro[];

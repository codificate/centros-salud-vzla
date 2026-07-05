import type { Geolocalizacion } from "@/lib/api/types";

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance between two coordinates, in kilometers. */
export function distanceKm(a: Geolocalizacion, b: Geolocalizacion): number {
  const dLat = toRadians(b.latitud - a.latitud);
  const dLon = toRadians(b.longitud - a.longitud);
  const lat1 = toRadians(a.latitud);
  const lat2 = toRadians(b.latitud);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

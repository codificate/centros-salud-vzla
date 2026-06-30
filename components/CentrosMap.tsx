"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Centro } from "@/lib/centros";

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const PIN = L.divIcon({
  className: "drop-pin",
  html: `<span aria-hidden="true" style="display:inline-block;width:18px;height:18px;border-radius:9999px;background:#ef4444;border:2px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,.25);transform:translate(-50%,-100%);"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 18],
});

export default function CentrosMap({
  centros,
  onSelect,
}: {
  centros: Centro[];
  onSelect: (centro: Centro) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { scrollWheelZoom: false });
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: ATTR }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers = centros.map((c) =>
      L.marker([c.geolocalizacion.latitud, c.geolocalizacion.longitud], {
        icon: PIN,
        title: c.nombre,
        alt: c.nombre,
      })
        .addTo(map)
        .on("click", () => onSelectRef.current(c))
    );

    if (markers.length) {
      map.fitBounds(L.featureGroup(markers).getBounds().pad(0.2));
    }

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [centros]);

  return (
    <div
      ref={containerRef}
      className="h-[70vh] w-full overflow-hidden rounded-lg border border-slate-200"
      role="region"
      aria-label="Mapa de centros"
    />
  );
}

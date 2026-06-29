"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export default function CentroMap({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 16,
      scrollWheelZoom: false,
    });

    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: ATTR }).addTo(map);

    const icon = L.divIcon({
      className: "drop-pin",
      html: `<span aria-hidden="true" style="display:inline-block;width:18px;height:18px;border-radius:9999px;background:#ef4444;border:2px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,.25);transform:translate(-50%,-100%);"></span>`,
      iconSize: [18, 18],
      iconAnchor: [9, 18],
    });

    L.marker([lat, lng], { icon, title: name, alt: name }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, name]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="region"
      aria-label={`Mapa de ${name}`}
    />
  );
}

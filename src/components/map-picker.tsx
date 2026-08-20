"use client";

import { useEffect, useMemo } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { Office, Point } from "@/lib/types";

const pinIcon = L.divIcon({
  className: "",
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:#0ea5e9;color:white;border:3px solid rgba(255,255,255,0.9);box-shadow:0 12px 30px rgba(14,165,233,0.45)">📍</div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

const officeIcon = L.divIcon({
  className: "",
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:#f97316;color:white;border:3px solid rgba(255,255,255,0.9);box-shadow:0 12px 30px rgba(249,115,22,0.45)">🏢</div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

export default function MapPicker({
  center,
  office,
  radiusKm,
  onPick,
  onSetArrival,
}: {
  center: Point;
  office?: Office;
  radiusKm: number;
  onPick: (point: Point) => void;
  onSetArrival: (point: Point) => void;
}) {
  const initialCenter = useMemo(() => center, [center]);

  return (
    <MapContainer
      center={initialCenter}
      zoom={12}
      scrollWheelZoom
      doubleClickZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapCenterSync center={center} />
      <MapEvents onPick={onPick} onSetArrival={onSetArrival} />

      <Circle
        center={center}
        radius={radiusKm * 1000}
        pathOptions={{ color: "#38bdf8", fillColor: "#0ea5e9", fillOpacity: 0.12 }}
      />
      <Marker position={center} icon={pinIcon} />

      {office ? <Marker position={{ lat: office.lat, lng: office.lng }} icon={officeIcon} /> : null}
    </MapContainer>
  );
}

function MapEvents({
  onPick,
  onSetArrival,
}: {
  onPick: (point: Point) => void;
  onSetArrival: (point: Point) => void;
}) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
    dblclick(event) {
      onSetArrival({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

function MapCenterSync({ center }: { center: Point }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

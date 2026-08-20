import type { Point } from "@/lib/types";

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: Point, b: Point) {
  const dLat = degreesToRadians(b.lat - a.lat);
  const dLng = degreesToRadians(b.lng - a.lng);

  const lat1 = degreesToRadians(a.lat);
  const lat2 = degreesToRadians(b.lat);

  const inner =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(inner), Math.sqrt(1 - inner));
}

export function estimateMinutes(distanceKm: number, mode: "drive" | "walk" = "drive") {
  const speedKmH = mode === "walk" ? 4.5 : distanceKm > 18 ? 31 : 24;
  const trafficMultiplier = mode === "drive" ? 1.25 : 1;
  return (distanceKm / speedKmH) * 60 * trafficMultiplier + (mode === "drive" ? 7 : 0);
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

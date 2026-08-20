import { NextResponse } from "next/server";
import { haversineKm } from "@/lib/geo";
import { getNeighborhoods } from "@/lib/db";
import type { Point } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radiusKm = Number(searchParams.get("radiusKm") ?? 5);

  if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radiusKm)) {
    return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
  }

  const center: Point = { lat, lng };
  const source = await getNeighborhoods();
  const results = source
    .map((neighborhood) => ({
      ...neighborhood,
      distanceKm: haversineKm(center, neighborhood),
    }))
    .filter((neighborhood) => neighborhood.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return NextResponse.json({
    center,
    radiusKm,
    neighborhoods: results,
  });
}

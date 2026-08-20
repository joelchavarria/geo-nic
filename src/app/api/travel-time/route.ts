import { NextResponse } from "next/server";
import { getTravelEstimate } from "@/lib/travel";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fromLat = Number(searchParams.get("fromLat"));
  const fromLng = Number(searchParams.get("fromLng"));
  const toLat = Number(searchParams.get("toLat"));
  const toLng = Number(searchParams.get("toLng"));
  const mode = searchParams.get("mode") === "walk" ? "walk" : "drive";

  if (
    [fromLat, fromLng, toLat, toLng].some((value) => Number.isNaN(value))
  ) {
    return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
  }

  const result = await getTravelEstimate(
    { lat: fromLat, lng: fromLng },
    { lat: toLat, lng: toLng },
    mode,
  );

  return NextResponse.json(result);
}

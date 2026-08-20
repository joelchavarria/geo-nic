import { NextResponse } from "next/server";
import { geocodeQuery } from "@/lib/geocode";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ error: "q is required" }, { status: 400 });
  }

  const result = await geocodeQuery(q);

  if (!result) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}

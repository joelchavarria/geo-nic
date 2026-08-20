import { getNeighborhoods } from "@/lib/db";
import type { Point } from "@/lib/types";

type GeocodeResult = {
  point: Point;
  label: string;
};

export async function geocodeQuery(query: string): Promise<GeocodeResult | null> {
  const normalized = query.trim().toLowerCase();
  const neighborhoods = await getNeighborhoods();
  const match =
    neighborhoods.find((neighborhood) => neighborhood.name.toLowerCase() === normalized) ??
    neighborhoods.find(
      (neighborhood) => `${neighborhood.name}, ${neighborhood.city}`.toLowerCase() === normalized,
    ) ??
    neighborhoods.find((neighborhood) => neighborhood.name.toLowerCase().startsWith(normalized)) ??
    neighborhoods.find((neighborhood) => neighborhood.name.toLowerCase().includes(normalized));

  if (match) {
    return {
      point: { lat: match.lat, lng: match.lng },
      label: `${match.name}, ${match.city}`,
    };
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return null;
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query);
  url.searchParams.set("components", "country:NI");
  url.searchParams.set("key", process.env.GOOGLE_MAPS_API_KEY);

  const response = await fetch(url.toString(), { next: { revalidate: 60 * 60 * 24 } });
  if (!response.ok) return null;

  const data = (await response.json()) as {
    results?: Array<{
      formatted_address: string;
      geometry?: { location?: { lat: number; lng: number } };
    }>;
  };

  const result = data.results?.[0];
  const location = result?.geometry?.location;

  if (!result || !location) return null;

  return {
    point: { lat: location.lat, lng: location.lng },
    label: result.formatted_address,
  };
}

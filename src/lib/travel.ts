import { estimateMinutes, haversineKm } from "@/lib/geo";
import type { Point } from "@/lib/types";

export async function getTravelEstimate(
  from: Point,
  to: Point,
  mode: "drive" | "walk" = "drive",
) {
  const distanceKm = haversineKm(from, to);

  if (process.env.GOOGLE_MAPS_API_KEY) {
    const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
    url.searchParams.set("origin", `${from.lat},${from.lng}`);
    url.searchParams.set("destination", `${to.lat},${to.lng}`);
    url.searchParams.set("mode", mode);
    url.searchParams.set("key", process.env.GOOGLE_MAPS_API_KEY);

    const response = await fetch(url.toString(), { next: { revalidate: 60 * 15 } });
    if (response.ok) {
      const data = (await response.json()) as {
        routes?: Array<{
          legs?: Array<{
            duration?: { value: number; text: string };
            distance?: { value: number; text: string };
          }>;
        }>;
      };

      const leg = data.routes?.[0]?.legs?.[0];
      if (leg?.duration && leg.distance) {
        return {
          provider: "google-maps",
          distanceKm: leg.distance.value / 1000,
          minutes: leg.duration.value / 60,
          text: `${leg.distance.text} · ${leg.duration.text}`,
        };
      }
    }
  }

  const minutes = estimateMinutes(distanceKm, mode);

  return {
    provider: "heuristic",
    distanceKm,
    minutes,
    text: `${distanceKm.toFixed(1)} km estimados por linea recta`,
  };
}

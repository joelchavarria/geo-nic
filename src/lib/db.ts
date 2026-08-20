import { neon } from "@neondatabase/serverless";
import { neighborhoods, offices } from "@/lib/nicaragua-data";
import type { Neighborhood, Office } from "@/lib/types";

const client = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export async function getNeighborhoods(): Promise<Neighborhood[]> {
  if (!client) return neighborhoods;

  try {
    const rows = (await client`
      select id, name, city, state, employment_hint, lat, lng
      from neighborhoods
      order by name asc
    `) as Array<{
      id: string;
      name: string;
      city: string;
      state: string;
      employment_hint: string;
      lat: number;
      lng: number;
    }>;

    if (!rows.length) return neighborhoods;

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      city: row.city,
      state: row.state,
      employmentHint: row.employment_hint,
      lat: Number(row.lat),
      lng: Number(row.lng),
    }));
  } catch {
    return neighborhoods;
  }
}

export async function getOffices(): Promise<Office[]> {
  if (!client) return offices;

  try {
    const rows = (await client`
      select id, name, city, state, lat, lng
      from offices
      order by name asc
    `) as Array<{
      id: string;
      name: string;
      city: string;
      state: string;
      lat: number;
      lng: number;
    }>;

    if (!rows.length) return offices;

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      city: row.city,
      state: row.state,
      lat: Number(row.lat),
      lng: Number(row.lng),
    }));
  } catch {
    return offices;
  }
}

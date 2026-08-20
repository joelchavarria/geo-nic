import { writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const query = `[out:json][timeout:60];
area["name"="Managua"]["boundary"="administrative"]->.a;
(
  node(area.a)["place"~"suburb|neighbourhood|quarter|locality"];
  way(area.a)["place"~"suburb|neighbourhood|quarter|locality"];
  relation(area.a)["place"~"suburb|neighbourhood|quarter|locality"];
);
out center tags;`;

const wanted = [
  "Altamira",
  "Bosques de Altamira",
  "Planes de Altamira 1",
  "Planes de Altamira 2",
  "Planes de Altamira 3",
  "Villa Fontana Este",
  "Villa Fontana Norte",
  "Villa Fontana Sur",
  "Inmaculada Villa Fontana",
  "Madroños Villa Fontana",
  "Los Robles",
  "Colonial Los Robles 1",
  "Colonial Los Robles 2",
  "Colonial Los Robles 3",
  "Colonial Los Robles 4",
  "Colonial Los Robles 5",
  "Colonial Los Robles 6",
  "Colonial Los Robles 7",
  "Colonial Los Robles 8",
  "Bello Horizonte 1",
  "Bello Horizonte 2",
  "Bello Horizonte 3",
  "Bello Horizonte 4",
  "Bello Horizonte 5",
  "Bello Horizonte 6",
  "San Judas",
  "Bolonia",
  "Reparto Schick",
  "Carretera a Masaya",
  "Centro de Managua",
  "Estancia de Santo Domingo",
];

const { stdout } = await execFileAsync("curl", [
  "-s",
  "-X",
  "POST",
  "-H",
  "Content-Type: application/x-www-form-urlencoded",
  "--data-urlencode",
  `data=${query}`,
  "https://overpass-api.de/api/interpreter",
]);

const data = JSON.parse(stdout);
const seen = new Set();

const neighborhoods = (data.elements ?? [])
  .map((element) => {
    const name = element?.tags?.name;
    if (!name) return null;

    const matched = wanted.find((entry) => name.toLowerCase().includes(entry.toLowerCase()));
    if (!matched) return null;

    const point = element.center ?? element;
    const key = name.toLowerCase();

    if (seen.has(key)) return null;
    seen.add(key);

    return {
      id: key.replace(/[^a-z0-9]+/g, "-"),
      name,
      city: "Managua",
      state: "Managua",
      lat: Number(point.lat),
      lng: Number(point.lon),
      employmentHint: "Zona detectada desde OpenStreetMap",
      source: "openstreetmap",
      place: element?.tags?.place ?? "",
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.name.localeCompare(b.name));

await writeFile(
  new URL("../src/lib/managua-osm.generated.json", import.meta.url),
  `${JSON.stringify(neighborhoods, null, 2)}\n`,
);

console.log(`Generated ${neighborhoods.length} Managua places`);

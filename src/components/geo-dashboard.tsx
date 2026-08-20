"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AlertCircle, MapPin, Navigation, Search } from "lucide-react";
import type { Neighborhood, Point } from "@/lib/types";
import { estimateMinutes } from "@/lib/geo";

const MapPicker = dynamic(() => import("@/components/map-picker"), {
  ssr: false,
});

type NearbyResponse = {
  center: Point;
  radiusKm: number;
  neighborhoods: Array<Neighborhood & { distanceKm: number }>;
};

const defaultCenter = { lat: 12.11499, lng: -86.2361 };

export function GeoDashboard() {
  const [draftPoint, setDraftPoint] = useState<Point>(defaultCenter);
  const [arrivalPoint, setArrivalPoint] = useState<Point | null>(null);
  const [query, setQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
  const [nearby, setNearby] = useState<NearbyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const point = arrivalPoint;

    if (!point) return;

    const { lat, lng } = point;

    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const nearbyUrl = new URL("/api/nearby", window.location.origin);
        nearbyUrl.searchParams.set("lat", String(lat));
        nearbyUrl.searchParams.set("lng", String(lng));
        nearbyUrl.searchParams.set("radiusKm", String(radiusKm));

        const nearbyRes = await fetch(nearbyUrl, { signal: controller.signal });
        if (!nearbyRes.ok) {
          throw new Error("No se pudo calcular barrios cercanos");
        }

        const nearbyData = (await nearbyRes.json()) as NearbyResponse;
        setNearby(nearbyData);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error ? requestError.message : "Error inesperado",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => controller.abort();
  }, [arrivalPoint, radiusKm]);

  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const url = new URL("/api/geocode", window.location.origin);
      url.searchParams.set("q", query.trim());

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("No se pudo ubicar la direccion");
      }

      const data = (await response.json()) as {
        point: Point;
        label: string;
      };

      setDraftPoint(data.point);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Error inesperado",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleDefineArrivalPoint() {
    setArrivalPoint(draftPoint);
  }

  function handleSetArrivalFromMap(point: Point) {
    setDraftPoint(point);
    setArrivalPoint(point);
  }

  const activeCenter = arrivalPoint ?? draftPoint;
  const displayedNeighborhoods = arrivalPoint ? nearby?.neighborhoods ?? [] : [];
  const averageMinutes = displayedNeighborhoods.length
    ? displayedNeighborhoods.reduce(
        (sum, neighborhood) => sum + estimateMinutes(neighborhood.distanceKm, "drive"),
        0,
      ) / displayedNeighborhoods.length
    : 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1d4ed8_0,_#0f172a_34%,_#020617_100%)] text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 lg:px-8">
        <header className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-200">
              Nicaragua Geo Recruit
            </span>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Define el punto de llegada y valida barrios cercanos en Nicaragua.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Primero buscas una direccion o tocas el mapa. Luego presionas definir punto de
              llegada y empiezas a ver los barrios y el tiempo estimado dentro del radio.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Centro actual" value={arrivalPoint ? "Definido" : "Pendiente"} />
            <StatCard label="Radio activo" value={`${radiusKm.toFixed(1)} km`} />
            <StatCard label="Barrios" value={String(displayedNeighborhoods.length)} />
            <StatCard label="Tiempo prom." value={arrivalPoint ? `${Math.round(averageMinutes)} min` : "--"} />
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <aside className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
              <label className="text-sm font-medium text-slate-200">Buscar direccion de oficina o planta</label>
              <div className="flex gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Ej. Bolonia, Managua"
                    className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        void handleSearch();
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleSearch()}
                  className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
                >
                  Ir
                </button>
              </div>

              <Field label="Radio (km)">
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={0.5}
                  value={radiusKm}
                  onChange={(event) => setRadiusKm(Number(event.target.value))}
                  className="w-full accent-sky-400"
                />
                <div className="mt-2 text-sm text-slate-300">{radiusKm.toFixed(1)} km</div>
              </Field>

              <button
                type="button"
                onClick={handleDefineArrivalPoint}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
              >
                <Navigation className="h-4 w-4" />
                Definir punto de llegada
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard
                icon={<MapPin className="h-4 w-4" />}
                label="Punto draft"
                value={`${draftPoint.lat.toFixed(5)}, ${draftPoint.lng.toFixed(5)}`}
              />
              <InfoCard icon={<Navigation className="h-4 w-4" />} label="Punto fijo" value={arrivalPoint ? `${arrivalPoint.lat.toFixed(5)}, ${arrivalPoint.lng.toFixed(5)}` : "Pendiente"} />
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Resultado de validacion
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {arrivalPoint
                  ? "El mapa ya quedo fijado. Cambia radio o mueve el punto draft y vuelve a definirlo cuando quieras recalcular."
                  : "Todavia no se ha definido el punto de llegada."}
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-4">
                  <span>Barrios encontrados</span>
                  <span className="font-semibold text-white">{displayedNeighborhoods.length}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Tiempo estimado</span>
                  <span className="font-semibold text-white">
                    {arrivalPoint ? `${Math.round(averageMinutes)} min` : "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Estado</span>
                  <span className="font-semibold text-white">{arrivalPoint ? "Definido" : "Pendiente"}</span>
                </div>
              </div>
            </div>

            {error ? (
              <div className="flex items-start gap-3 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}
          </aside>

          <section className="grid gap-6 xl:grid-rows-[420px_1fr]">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 p-3 shadow-2xl shadow-slate-950/30 backdrop-blur">
              <div className="h-[30rem] overflow-hidden rounded-[1.75rem]">
                <MapPicker
                  center={activeCenter}
                  radiusKm={radiusKm}
                  onPick={setDraftPoint}
                  onSetArrival={handleSetArrivalFromMap}
                />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
                <h2 className="text-lg font-semibold text-white">Barrios cerca del punto</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Esta lista se recalcula cuando defines el punto de llegada. Doble clic en el mapa
                  para fijarlo de una vez.
                </p>
                <div className="mt-4 space-y-3">
                  {!arrivalPoint ? (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-400">
                      Define primero el punto de llegada para ver los barrios cercanos.
                    </div>
                  ) : loading && !nearby ? (
                    <SkeletonList />
                  ) : displayedNeighborhoods.length ? (
                    displayedNeighborhoods.map((neighborhood) => {
                      const minutes = estimateMinutes(neighborhood.distanceKm, "drive");

                      return (
                        <article
                          key={neighborhood.id}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                        >
                          <div>
                            <div className="font-medium text-white">{neighborhood.name}</div>
                            <div className="text-sm text-slate-400">
                              {neighborhood.city} · {neighborhood.state}
                            </div>
                          </div>
                          <div className="text-right text-sm text-slate-300">
                            <div className="font-semibold text-white">
                              {neighborhood.distanceKm.toFixed(2)} km
                            </div>
                            <div>{Math.round(minutes)} min aprox.</div>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <EmptyState />
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
                <h2 className="text-lg font-semibold text-white">Tiempo de viaje</h2>
                <p className="mt-1 text-sm text-slate-400">
                  El tiempo se estima por barrio dentro del radio. Luego lo podemos cambiar a rutas
                  reales por carro, moto o caminando.
                </p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm text-slate-400">Ruta calculada</div>
                    <div className="mt-1 text-2xl font-semibold text-white">
                      {arrivalPoint ? `${Math.round(averageMinutes)} minutos` : "--"}
                    </div>
                    <div className="mt-1 text-sm text-slate-300">
                      {arrivalPoint
                        ? "Promedio de tiempo estimado entre el punto de llegada y los barrios encontrados."
                        : "Primero define el punto de llegada."}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    <div className="font-semibold text-white">Siguiente paso real</div>
                    <ul className="mt-2 space-y-2">
                      <li>Conectar Neon para guardar puntos de llegada mas usados.</li>
                      <li>Usar Google Maps Directions para tiempo real de viaje.</li>
                      <li>Cargar barrios por ciudad desde un GeoJSON oficial de Managua.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2 text-sm text-slate-300">
      <span>{label}</span>
      {children}
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="rounded-2xl bg-sky-500/15 p-2 text-sky-300">{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
        <div className="mt-1 text-sm font-medium text-white">{value}</div>
      </div>
    </div>
  );
}

function SkeletonList() {
  return Array.from({ length: 4 }).map((_, index) => (
    <div
      key={index}
      className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/5"
    />
  ));
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-400">
      No hay barrios dentro del radio. Mueve el mapa o sube el rango.
    </div>
  );
}

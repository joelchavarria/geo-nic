import type { Neighborhood, Office } from "@/lib/types";
import managuaOsm from "@/lib/managua-osm.generated.json";

export const offices: Office[] = [
  {
    id: "managua-hq",
    name: "Oficina Managua Centro",
    city: "Managua",
    state: "Managua",
    lat: 12.1364,
    lng: -86.2514,
  },
  {
    id: "managua-east",
    name: "Planta Carretera Masaya",
    city: "Managua",
    state: "Managua",
    lat: 12.0813,
    lng: -86.2079,
  },
];

const managuaNeighborhoods = (managuaOsm as Array<{
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  employmentHint: string;
}>).map((neighborhood) => ({
  ...neighborhood,
  source: "openstreetmap",
}));

export const neighborhoods: Neighborhood[] = [
  ...managuaNeighborhoods,
  {
    id: "leon-centro",
    name: "Centro de Leon",
    city: "Leon",
    state: "Leon",
    lat: 12.4354,
    lng: -86.8798,
    employmentHint: "Nodo urbano universitario",
  },
  {
    id: "granada-centro",
    name: "Centro de Granada",
    city: "Granada",
    state: "Granada",
    lat: 11.9332,
    lng: -85.9560,
    employmentHint: "Centro turistico y comercial",
  },
  {
    id: "masaya-centro",
    name: "Centro de Masaya",
    city: "Masaya",
    state: "Masaya",
    lat: 11.9715,
    lng: -86.0952,
    employmentHint: "Mercado laboral regional",
  },
  {
    id: "chinandega-centro",
    name: "Centro de Chinandega",
    city: "Chinandega",
    state: "Chinandega",
    lat: 12.6294,
    lng: -87.1311,
    employmentHint: "Zona de comercio y logistica",
  },
  {
    id: "esteli-centro",
    name: "Centro de Esteli",
    city: "Esteli",
    state: "Esteli",
    lat: 13.0892,
    lng: -86.3538,
    employmentHint: "Corredor de servicios del norte",
  },
  {
    id: "matagalpa-centro",
    name: "Centro de Matagalpa",
    city: "Matagalpa",
    state: "Matagalpa",
    lat: 12.9256,
    lng: -85.9175,
    employmentHint: "Zona urbana intermedia",
  },
  {
    id: "rivas-centro",
    name: "Centro de Rivas",
    city: "Rivas",
    state: "Rivas",
    lat: 11.4390,
    lng: -85.8286,
    employmentHint: "Acceso al sur del pais",
  },
];

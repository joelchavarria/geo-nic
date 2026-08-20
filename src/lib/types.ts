export type Point = {
  lat: number;
  lng: number;
};

export type Neighborhood = Point & {
  id: string;
  name: string;
  city: string;
  state: string;
  employmentHint: string;
};

export type Office = Point & {
  id: string;
  name: string;
  city: string;
  state: string;
};

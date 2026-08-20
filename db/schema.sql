create extension if not exists postgis;

create table if not exists offices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  state text not null,
  lat double precision not null,
  lng double precision not null,
  geom geography(point, 4326) generated always as (
    st_setsrid(st_makepoint(lng, lat), 4326)::geography
  ) stored,
  created_at timestamptz not null default now()
);

create table if not exists neighborhoods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  state text not null,
  employment_hint text not null,
  lat double precision not null,
  lng double precision not null,
  geom geography(point, 4326) generated always as (
    st_setsrid(st_makepoint(lng, lat), 4326)::geography
  ) stored,
  created_at timestamptz not null default now()
);

create index if not exists neighborhoods_geom_idx on neighborhoods using gist (geom);
create index if not exists offices_geom_idx on offices using gist (geom);

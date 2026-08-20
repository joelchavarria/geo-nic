# Nicaragua Geo Recruit

MVP fullstack en Next.js para validar barrios cercanos y tiempo de viaje en Nicaragua.

## Stack

- Next.js App Router
- Vercel
- Neon Postgres + PostGIS
- OpenStreetMap + Leaflet
- Google Maps opcional para geocoding y rutas reales

## Correr local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre `http://localhost:3000`.

## Variables de entorno

- `GOOGLE_MAPS_API_KEY`: opcional, activa geocoding y tiempos reales.
- `DATABASE_URL`: URL de Neon.

## Base de datos en Neon

1. Crea una base de datos en Neon.
2. Copia la `DATABASE_URL` en Vercel y en `.env.local`.
3. Ejecuta el SQL de `db/schema.sql` en el editor de Neon.
4. La app ya lee Neon automaticamente cuando existe `DATABASE_URL`; si no, usa datos semilla.

## Deploy en Vercel

1. Sube este repo a GitHub.
2. Importa el proyecto en Vercel.
3. Agrega `DATABASE_URL` y `GOOGLE_MAPS_API_KEY` si la vas a usar.
4. Deploy.

# Workweek

Management app for home services businesses: sign up, manage employees, manage clients, and view clients on a map.

## Setup

```bash
npm install
cp .env.example .env
```

No API key needed — the map uses [Leaflet](https://leafletjs.com/) with OpenStreetMap tiles, and addresses are geocoded via OpenStreetMap's [Nominatim](https://nominatim.org/) service, both free.

## Run

```bash
npm run dev   # with auto-reload
npm start     # production-style
```

App runs at http://localhost:3000. SQLite data is stored in `data/workweek.sqlite` (gitignored).

## Features

- Business signup / login (session-based auth, one account per business)
- Employee management (add / remove)
- Client management with addresses (add / remove); addresses are geocoded server-side on save
- Map view of all clients with resolved addresses (Leaflet + OpenStreetMap)

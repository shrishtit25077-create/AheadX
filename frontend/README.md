# AHEADX Command Center (Platform Prototype P1)

This is the web command-center interface for **AHEADX** — Real-Time Road Safety & Traffic Intelligence.

---

## Tech Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **Routing:** React Router v6
- **GIS Mapping:** Leaflet & React-Leaflet (CartoDB Dark Matter tiles)
- **Analytics:** Recharts

---

## Route Overview
- `/` or `/dashboard`: **Command Center** — Primary operations console with video telemetry and active event feeds.
- `/monitoring`: **Live Monitoring** — Multi-camera grid with modal camera inspection.
- `/incidents`: **Incidents** — Filterable incident table with verification workflow.
- `/risk-map`: **Risk Map** — Interactive dark GIS map with risk level markers.
- `/analytics`: **Analytics** — Trend curves, category breakdowns, and vehicle density charts.

---

## Development

```bash
# 1. Install dependencies (from within frontend/)
npm install

# 2. Run local development server
npm run dev

# 3. Build for production bundle
npm run build
```

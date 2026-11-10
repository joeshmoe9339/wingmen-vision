# Wingmen Vision
Surveillance, OSINT, and threat-intelligence dashboard for security operations.

## Stack
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS 4
- Backend: Node.js (ESM) + Express-style HTTP API (no framework dependency)
- Database: Supabase (PostgreSQL) — live endpoints via `backend/lib/live_api.ts`
- Modules: 26+ security/OSINT/AI tools linked as `modules/` symlinks

## Quick Start (Local Development)

### 1. Configure environment variables
```bash
cp .env.example .env
# Edit .env: fill SUPABASE_URL, SUPABASE_SERVICE_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

### 2. Start the backend API server
```bash
cd backend
npm run dev          # uses --experimental-strip-types
# OR
node server.ts       # after `npm install`
```
The backend listens on **http://localhost:8081** by default (set `PORT` to change).

### 3. Start the frontend dev server
```bash
npm run dev
```
Open http://localhost:5173

## Production Build
```bash
npm run build        # tsc -b && vite build
```

## Backend API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status` | Health + network scan (found cameras) |
| GET | `/api/cameras` | List cameras |
| POST | `/api/cameras` | Add camera |
| GET | `/api/events` | List security events (filter: `?device_id=&severity=`) |
| POST | `/api/events` | Create security event |
| GET | `/api/evidence` | List evidence |
| POST | `/api/evidence` | Create evidence |
| GET | `/api/evidence/:id/download-url` | Secure download URL |
| POST | `/api/evidence/:id/generate-report` | Generate PDF report bundle |
| GET | `/api/threats` | List threats (filter: `?device_id=`) |
| POST | `/api/threats` | Create threat detection |

## Deployment Notes
- **Frontend**: `vite build` outputs to `dist/`. Deploy to Vercel/Netlify (see `.vercelignore`).
- **Backend**: Deploy `backend/server.js` (compiled). Run behind a reverse proxy (nginx/Cloudflare).
- **Raspberry Pi agent**: `backend/raspi/systemd/wingmen-agent.service` + `agent/index.js` — for ONVIF stream ingestion on the edge device.
- **Supabase**: Deploy `backend/schemas/supabase_schema.sql` to create `cameras`, `security_events`, `evidence`, `threats` tables.
- **Modules**: All 26+ modules in `modules/` are symlinks to top-level repos (see `INTEGRATION.md`). No code in Wingmen Vision imports them directly — they are a reference/integration layer.
- **agent-desktop**: Vercel Labs computer-use library (explicitly flagged as missing in `INTEGRATION.md`). Optional — adds automated camera/access-control UI automation.
- **Frontend→Backend**: The frontend `api.ts` client falls back to an in-memory mock when the backend is unreachable, so the UI renders without the backend.

## Key File Locations
- Frontend API client: `src/lib/api.ts`
- Backend server: `backend/server.ts`
- Supabase client (frontend): `src/lib/supabase.ts`
- Supabase client (backend): `backend/lib/supabase_client.ts`
- Supabase schema: `backend/schemas/supabase_schema.sql`
- Modules: `modules/` (symlinks)

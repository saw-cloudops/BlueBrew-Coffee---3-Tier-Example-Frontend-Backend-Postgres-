
# BlueBrew Coffee - 3-Tier Example (Frontend + Backend + Postgres)

## What is included
- `frontend/` : Vite + React app (example App.jsx using your UI)
- `backend/` : Node.js + Express API (production-mode Dockerfile)
- `database/`: Postgres Dockerfile and `init.sql` (schema + seed)
- `docker-compose.yml` : Bring up all services locally
- `.env.example` in backend

## Quick local run (Docker Desktop)
1. Build and start:
   ```bash
   docker-compose up --build
   ```
2. Frontend: http://localhost:3000
   Backend API: http://localhost:4000
   Postgres: localhost:5432 (user=postgres password=postgres db=coffeeshop)

## Notes for production
- Replace the Postgres container with AWS RDS (update DB_HOST, DB_USER, DB_PASS, DB_NAME)
- Replace plain-text admin password with hashed password (bcrypt) and use env secrets.
- Add HTTPS, CORS origin restrictions, and proper JWT auth for admin routes.
- Build frontend for production (`npm run build`) and deploy to CDN or S3 + CloudFront.

## Files of interest
- `database/init.sql`: schema and initial seed
- `backend/server.js`: express routes
- `frontend/src/App.jsx`: React UI (simplified)

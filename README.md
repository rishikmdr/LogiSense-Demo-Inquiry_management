# LogiSense IMS — Inquiry Management System

A real-time web application replacing Excel-based inquiry tracking for LogiSense's overseas cargo shipping operations.

## Quick Start

```bash
# 1. Clone the repo
git clone <repo-url>
cd logisense-ims

# 2. Copy env file and update passwords
cp .env.example .env
# Edit .env with secure values

# 3. Start all services
docker compose up -d

# 4. Access the application
open http://localhost:3000
```

## Default Admin Login

```
Username: admin
Password: LogiSenseAdmin2026!
```

**Change this immediately after first login** via Settings → Users.

## Import Historical Data

```bash
docker compose exec backend node scripts/import-excel.js /path/to/EXPORT_BBK_FILE_016_NEW_REVISED.xlsx
```

Or use the web UI at `/import`.

## Architecture

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React + Vite SPA (Nginx) |
| Backend | 3001 | Node.js + Express API |
| Database | 5432 | PostgreSQL 15 |

## Development Setup

```bash
# Start just the database
docker compose -f docker-compose.dev.yml up -d

# Backend (hot reload)
cd backend
npm install
DATABASE_URL=postgresql://logisense:devpassword@localhost:5432/logisense_ims \
JWT_SECRET=dev-secret-change-me \
npm run dev

# Frontend (hot reload)
cd frontend
npm install
VITE_API_URL=http://localhost:3001 npm run dev
```

## Features

- **Inquiry Management** — Create, edit, filter, and track cargo inquiries
- **Status Workflow** — 8-stage pipeline from OPEN to SECURED/LOST
- **Remarks Thread** — Per-inquiry comment thread for team communication
- **Dashboard** — KPI cards, pipeline charts, activity feed
- **Consolidation Alerts** — Auto-detect shipments that can share a vessel
- **Duplicate Detection** — AI-assisted detection of similar inquiries
- **Excel Import** — Bulk import from BBK export format
- **CSV Export** — Filtered data export
- **Role-Based Access** — admin / sales / sales_support / viewer roles
- **Audit Log** — Complete history of all changes

## User Roles

| Role | Create | Edit | Delete | Import | Admin |
|------|--------|------|--------|--------|-------|
| admin | ✅ | ✅ Any | ✅ | ✅ | ✅ |
| sales | ✅ | ✅ Own | ❌ | ❌ | ❌ |
| sales_support | ✅ | ✅ Any | ❌ | ✅ | ❌ |
| viewer | ❌ | ❌ | ❌ | ❌ | ❌ |

## Environment Variables

```env
DB_PASSWORD=       # PostgreSQL password (required)
JWT_SECRET=        # JWT signing secret, min 32 chars (required)
```

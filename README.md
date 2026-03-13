<div align="center">

# JobAppliesTracker

> *No bloat. No ads. No subscriptions.  
 Runs on your machine or server.*

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)



Track applications across platforms, manage companies, schedule interviews, and see where your pipeline stands. All in one place.

</div>

--- 
<br/> 

**WIP**: This is a work in progress. The project is not yet ready for production, changes are expected. It is still stable to use. Database migrations (Alembic) support schema updates across versions.


## What it does

| Area | Capabilities |
|------|--------------|
| **Applications** | Job title, company, platform, salary, seniority, stages, history, archiving |
| **Companies** | Name, website, notes, linked to applications |
| **Platforms** | Job boards (LinkedIn, Indeed, etc.) with templates for quick entry |
| **Profile** | Resumes and profile data for fast attachment to applications |
| **Calendar** | Appointments and interviews with meeting URLs |
| **Dashboard** | Summary cards, status distribution, platform ranking, weekly heatmap |



## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, Tailwind, shadcn/ui, Turborepo |
| Backend | FastAPI, SQLAlchemy, Alembic |
| Data | PostgreSQL |
| Runtime | Docker |


## Setup

### Docker

**Prerequisites:** Docker 

```bash
git clone <repository-url>
cd JobAppliesTracker
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:root@localhost:5432/jobtracker
STORAGE_DIR=./storage
```

```bash
docker compose up --build -d
```

Run migrations (required on first setup; also run after pulling updates that include new migrations):

```bash
docker exec jobappliestracker-backend alembic upgrade head
```

| Service | URL |
|---------|-----|
| App | [http://localhost:3000](http://localhost:3000) |
| API | [http://localhost:8000](http://localhost:8000) |
| API docs | [http://localhost:8000/docs](http://localhost:8000/docs) |

### Local Environment

**Prerequisites:** Node 20+, pnpm, Python 3.11+, PostgreSQL

1. Start PostgreSQL. Create database `jobtracker`:

```
createdb jobtracker
```

2. Create `backend/.env`:

```
DATABASE_URL=postgresql://postgres:root@localhost:5432/jobtracker
STORAGE_DIR=./storage
```

3. Backend:

**Prerequisites:** Set up Python virtual environment.

```bash
cd backend
pip install -r requirements.txt
```

Run migrations (required on first setup; also run after pulling updates that include new migrations):

```bash
alembic upgrade head
```

```bash
uvicorn app.main:app --reload
```

4. Frontend (another terminal):

```bash
cd frontend
pnpm install
pnpm dev
```



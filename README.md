<div align="center">

# JobAppliesTracker

> *No bloat. No ads. No subscriptions.  
 Runs on your machine or server.*

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791?logo=postgresql)](https://www.postgresql.org/)



Track applications across platforms, manage companies, schedule interviews, and see where your pipeline stands. All in one place.

</div>

--- 
<br/> 

**WIP.** Not production-grade yet. Breaking changes are possible. Fine for daily use. Schema changes ship as Alembic migrations.


## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui, Turborepo |
| Backend | FastAPI, SQLAlchemy, Alembic |
| Data | PostgreSQL |
| Runtime | Docker |
| Testing | Vitest + React Testing Library, Pytest |


## Features

### Dashboard

Default home when you load the app (`/dashboard`).

- Totals, response rate, and time-in-stage summary
- Week strip of upcoming appointments
- Stage distribution, recent applications, platform ranking, weekly heatmap
- Hide any widget from Settings

### Applications

Primary list for every application you track.

- Filters, sort, pagination, optional archived view
- Stage history (add, edit, remove entries)
- Archive and restore
- Read-only detail from the job title
- Linked resume, appointments scoped to that application
- Extra columns and compact rows (Settings)

### Companies

Directory of employers.

- Name, website, notes
- New or updated names can attach existing applications that used the same string

### Platforms

Job boards you apply through.

- One row per board (e.g. LinkedIn, Indeed)
- Templates feed autocomplete when creating applications

### Calendar

Full-month schedule.

- Grid and agenda
- Event types: interview, assessment, project, meeting, other
- Optional meeting URL and optional link to an application

### Profile

Resumes and text you reuse on forms.

- CV upload, rename, archive, delete, download
- Preset fields (contact and links) plus custom key/value rows

### Settings

Global display and layout.

- 12h or 24h, timezone, locale
- Which dashboard widgets appear; calendar strip starts expanded or not
- Applications table: optional columns and density

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui, Turborepo |
| Backend | FastAPI, SQLAlchemy, Alembic |
| Data | PostgreSQL |
| Runtime | Docker |
| Testing | Vitest + React Testing Library, Pytest |


## Setup

You can run the application via Docker or locally.

URLs for the services:
| Service | URL |
|---------|-----|
| App | [http://localhost:3000](http://localhost:3000) |
| API | [http://localhost:8000](http://localhost:8000) |
  
<br/>

**Note:**  
Running migrations is required on first setup. Also run after pulling updates that include new migrations.

**Prerequisites:**  
- Setup up `backend/.env` (see `backend/.env.example`)
- Setup up `frontend/.env` (see `frontend/.env.example`)



## Docker

```bash
git clone https://github.com/leobrqz/JobAppliesTracker.git
cd JobAppliesTracker
```


Start the services:

```bash
docker compose up --build -d
```

Run migrations:

```bash
docker exec jobappliestracker-backend alembic upgrade head
```


## Local Environment

**Prerequisites:** Node 20+, pnpm, Python 3.11+, PostgreSQL

### 1. PostgreSQL
Start PostgreSQL and create database `jobtracker`  


### 2. Backend  

**Prerequisites:** Set up Python virtual environment.

```bash
cd backend
pip install -r requirements.txt
```

Run migrations:

```bash
alembic upgrade head
```

Run the backend:
```bash
uvicorn app.main:app --reload
```

### 3. Frontend:

```bash
cd frontend
pnpm install
pnpm dev
```



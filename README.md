<div align="center">

# JobAppliesTracker

> *No bloat. No ads. No subscriptions.  
 Runs on your machine or server.*

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)



Track applications across platforms, manage companies, schedule interviews, and see where your pipeline stands. All in one place.

</div>

--- 
<br/> 

**WIP.** This is a work in progress. The project is not yet ready for production, breaking changes are possible. It is stable to use. Database migrations support schema updates across versions.


## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui, Turborepo |
| Backend | FastAPI, SQLAlchemy, Alembic |
| Data | PostgreSQL (Supabase) |
| Runtime | Docker |
| Testing | Vitest + React Testing Library, Pytest |


## Features

### Dashboard

Default home when you load the app (`/dashboard`).

- Application count (with offers/rejections), response rate, average days per stage
- Week strip of upcoming appointments
- Stage distribution (pie chart), recent applications, platform conversion ranking, weekly heatmap
- Hide any widget from Settings

### Applications

Primary list for every application you track.

- Filter by status, stage, platform, company, and active vs archived; column sort; pagination
- Stage history (add, edit, remove entries)
- Archive and restore
- Detail view from the job title
- Create and edit: job title, company, platform, posting URL, contract type, seniority, salary, applied date, stage, status, resume
- Linked resume; appointments scoped to that application
- Extra columns and compact rows (Settings)

### Companies

Directory of employers.

- Name, website, notes
- New company: links applications that already used the same company text but were not linked yet
- Rename company: updates the company text on applications already linked to that record

### Platforms

Job boards and career sites you record applications against.

- Dedicated page: create, edit, and delete platforms
- Each row: name, optional icon, base URL and "applications" URL (open from the table), **manual resume** flag for boards where you fill a CV on their site
- Built-in **templates** pre-fill name, icon, and URLs when you add or edit a platform
- Applications pick a platform; the applications list can filter by platform

### Calendar

Full-month schedule.

- Month grid and agenda views
- Event types: interview, assessment, project, meeting, other
- Optional meeting URL and optional link to an application

### Profile

Resumes and text you reuse on forms.

- CV upload, rename, archive, delete, download
- Presets: full name, email, phone, LinkedIn, GitHub, portfolio
- Customizable key/value rows

### Settings

Global display and layout.

- 12h or 24h, timezone, locale
- Dashboard: show or hide each widget; week strip starts expanded or collapsed
- Applications table: optional resume, salary, seniority, and created-at columns; compact row density

---


## Setup

You can run the application via Docker

**Note:**  
Running migrations is required on first setup. Also run after pulling updates that include new migrations.


**Prerequisites:**  
- Set up `backend/.env` (see `backend/.env.example`)
- Set up `supabase/.env` (see `supabase/.env.example`)
- Set up `frontend/apps/web/.env` (see `frontend/apps/web/.env.example`)

Also, check the [Supabase documentation](https://supabase.com/docs/guides/self-hosting/docker) for more information.

**You MUST set up Supabase .env before anything**


### 1. Clone the repository
```bash
git clone https://github.com/leobrqz/JobAppliesTracker.git
cd JobAppliesTracker
```

### 2. Start Supabase and create a new bucket

```bash
cd supabase && docker compose up -d
```

In **Supabase Studio** → **Storage** → **Create bucket**:
- Create a **private** bucket named `jobtracker` 


### 3. Start the app:
This will restart Supabase and start the frontend and backend.

```bash
./docker-up.sh
```

###  4. Run migrations:

```bash
./docker-alembic-upgrade.sh
```

### 5. Access the application:
- Next.js: http://localhost:3000
- Supabase: http://localhost:8000
- FastAPI: http://localhost:8001



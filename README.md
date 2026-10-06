<div align="center">

# Ajay Kumar Reddy · Data Analyst Portfolio

**A full-stack, owner-managed portfolio: a 3D data-themed React front end and a Python FastAPI back end.**
Visitors explore projects, education, skills and certificates and can send a message.
The owner signs in with a private key, edits everything from the browser, and reads messages in a built-in inbox.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![three.js](https://img.shields.io/badge/three.js-WebGL-000000?logo=threedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)

[LinkedIn](https://www.linkedin.com/in/ajayreddy8691) · [GitHub](https://github.com/ajayreddy8691)

</div>

<!-- Add screenshots: docs/screenshots/home.png, projects.png, inbox.png, mobile.png -->

---

## Table of contents

[Highlights](#highlights) · [Features](#features) · [Architecture](#architecture) · [Tech stack](#tech-stack) · [Project structure](#project-structure) · [Getting started](#getting-started) · [Configuration](#configuration) · [Data model](#data-model) · [API reference](#api-reference) · [Email notifications](#email-notifications) · [Deployment](#deployment) · [Security](#security) · [Performance](#performance-and-responsiveness) · [Testing](#testing) · [Troubleshooting](#troubleshooting) · [Roadmap](#roadmap)

---

## Highlights

- **No redeploys to update content.** Projects, education, experience, skills and certificates are managed in the browser through popup forms and stored in a database.
- **Owner-only controls.** Add, edit, delete and the message inbox appear only after signing in. The API enforces the key on every write, so hiding buttons is not the only protection.
- **Built-in inbox with notifications.** Contact messages are stored, shown with unread counts, and optionally emailed to the owner.
- **Smart ordering.** Education, experience and achievements always sort newest first, whatever order they were entered in.
- **Works even when the API is asleep.** The site renders instantly from built-in content and syncs when the server responds.
- **Layered Python API** with validation, typed settings, dependency-injected security and a pytest suite.

## Features

### For visitors
- 3D landing page: animated bar-chart "city", floating line chart and data points (three.js), a photo inside a rotating donut-chart ring with floating KPI cards, typing roles and live counters.
- **Toolkit:** skills grouped into boxes (Programming, Data Libraries, BI & Visualization, Databases, ...) plus a scrolling tool marquee.
- **Education** cards with grade, **Experience** timeline (shown once the first internship or job is added).
- **Projects:** equal-size cards with preview, title, two bullet points, tool tags and Code / Live links. Clicking a card opens a popup with the full details.
- **Achievements:** certificates and awards behind a Projects / Achievements filter.
- **Resume:** live preview, download and open-in-new-tab, served from Google Drive so updating the Drive file updates the site.
- Contact form with server-side validation, light and dark theme, mobile menu, keyboard-accessible controls and a reduced-motion setting.

### For the owner (after Owner login)
- **Add / edit / delete** skills, education, experience, projects and achievements from popup forms, including image upload with preview.
- **Smart skill boxes:** adding a skill under an existing heading merges into that box. A new heading creates a new box.
- **Floating inbox** (envelope button, bottom right): unread badge that drops as messages are read, compact rows that expand on hover or click, reply by email (Gmail compose, Outlook or mail app), copy email, mark read / unread, mark all read, delete, search and All / Unread tabs. Read state is stored on the server, so it syncs across devices.
- **Email notification** for every new message, with Reply-To set to the visitor.

## Architecture

```mermaid
flowchart LR
  Visitor([Visitor browser]) --> FE
  Owner([Owner browser]) --> FE
  subgraph Vercel
    FE["React + Vite + three.js"]
  end
  FE -->|"REST / JSON"| API
  subgraph Render
    API["FastAPI (Uvicorn)"]
  end
  API --> DB[("MySQL / SQLite")]
  API -->|"HTTPS"| Resend["Resend email API"]
  Resend --> Mailbox([Owner mailbox])
```

Request path inside the API:

```
HTTP request -> CORS middleware -> Router (+ require_admin dependency) -> Service -> SQLAlchemy -> database
```

**Design decisions**

- Skills, education, experience, projects and achievements are stored as validated JSON documents in one table, so adding a field to a card needs no database migration.
- The browser keeps a local copy of the content (seeded on first load). Every change is mirrored to the API, and server data wins when it exists.
- Email goes through an HTTPS API instead of SMTP, because many free hosts (including Render's free web services) block outbound SMTP ports.
- The API contract is identical to the Java version of this portfolio, so either back end works with the same front end.

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite 5, three.js, plain CSS (custom properties, 3D transforms) |
| Backend | Python 3.10+, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2, pydantic-settings, httpx |
| Database | SQLite (zero setup) or MySQL 8 via PyMySQL |
| Email | Resend HTTP API (optional) |
| Hosting | Vercel (frontend), Render (backend), any managed MySQL |

## Project structure

```
ajay-portfolio/
├── frontend/                         # Vite + React
│   ├── index.html · package.json · .env.example
│   └── src/
│       ├── main.jsx · App.jsx
│       ├── pages/                    # Home.jsx
│       ├── components/
│       │   ├── layout/               # Navbar, Footer, ThreeBackground
│       │   ├── sections/             # Hero, Skills, Education, Experience, ProjectsSection, Contact
│       │   ├── cards/                # ProjectCard, AchievementCard
│       │   ├── forms/                # Skill, Education, Experience, Project, Achievement forms
│       │   ├── modals/               # ResumeModal, OwnerLoginModal, ProjectDetailModal
│       │   └── ui/                   # FloatingInbox, Modal, Acts, Icons, Counter, ImagePicker, ...
│       ├── context/                  # OwnerContext, DataContext
│       ├── hooks/                    # useCollection, useForm, useReveal, useTypewriter, useNavLinks
│       ├── services/                 # api.js (HTTP client)
│       ├── utils/ · config/ · data/ · assets/
│       └── styles/                   # theme.css, sections.css, inbox.css
└── backend/                          # FastAPI (layered)
    ├── Dockerfile · requirements.txt · requirements-dev.txt · .env.example · pytest.ini
    ├── app/
    │   ├── main.py                   # app factory, CORS, error handlers, /health
    │   ├── api/routes/               # auth.py, content.py, contact.py
    │   ├── services/                 # content_service, contact_service, notification_service
    │   ├── models/                   # SQLAlchemy models (ContentDoc, ContactMessage)
    │   ├── schemas/                  # Pydantic request/response models
    │   ├── core/                     # config.py (settings), security.py (admin key), errors.py
    │   └── db/                       # session.py (engine, sessions, table creation)
    └── tests/                        # pytest + FastAPI TestClient
```

## Getting started

**Prerequisites:** Node 18+, Python 3.10+, Git (MySQL 8 is optional; SQLite works out of the box).

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate            # Windows Git Bash: source .venv/Scripts/activate   |   CMD: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                 # then edit ADMIN_KEY (at least 8 characters)
uvicorn app.main:app --reload --port 8000
```

The API runs on **http://localhost:8000** (interactive docs at `/docs`). Check it:

```bash
curl -i http://localhost:8000/api/content/skills     # 200 and []
curl -i http://localhost:8000/health                 # {"status":"ok"}
```

**Use MySQL instead of SQLite** by setting this in `.env` (the database is created automatically if your user may create it):

```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/ajay_portfolio?charset=utf8mb4
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.development     # VITE_API_URL=http://localhost:8000
npm run dev                          # http://localhost:5173
npm run dev -- --host                # also reachable from your phone on the same Wi-Fi
```

Vite reads env files only at startup, so restart it after changing them. Scroll to the footer, click **Owner login** and enter your `ADMIN_KEY`.

### 3. Run the backend in Docker (optional)

```bash
docker build -t ajay-portfolio-api backend
docker run -p 8000:8000 -e ADMIN_KEY=your-strong-key -e CORS_ORIGINS=http://localhost:5173 ajay-portfolio-api
```

## Configuration

### Backend (environment variables or `backend/.env`)

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `ADMIN_KEY` | **Yes** | none | Owner key (at least 8 characters). The app refuses to start without it. |
| `DATABASE_URL` | Prod | `sqlite:///./data/portfolio.db` | SQLAlchemy URL. MySQL: `mysql+pymysql://user:pass@host:3306/db?charset=utf8mb4` |
| `CORS_ORIGINS` | Prod | `http://localhost:5173` | Comma-separated frontend origins allowed to call the API (no trailing slash) |
| `PORT` | No | `8000` | Used by the Docker image (hosts such as Render set it) |
| `RESEND_API_KEY` | No | none | Enables email notifications |
| `NOTIFY_EMAIL` | No | none | Where notifications are sent |
| `NOTIFY_FROM` | No | `Portfolio <onboarding@resend.dev>` | Sender (verify your own domain for production) |
| `SITE_URL` | No | none | Adds a link to your site in the email |

### Frontend (Vite env)

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the API, with no trailing slash |
| `VITE_RESUME_FILE_ID` | Google Drive file id of the resume. Share the file as **Anyone with the link can view**. |

The file id is the part of the share link between `/d/` and `/view`. Replace the file in Drive (keep the same file) and the site always shows the latest version.

## Data model

Collections are `skills`, `education`, `experience`, `projects` and `ach` (achievements). Each item is a JSON object with an `id`.

```jsonc
// skills
{ "id": "k1", "head": "Programming", "items": ["Python", "Java (Basic)", "C"] }

// education
{ "id": "d1", "degree": "B.E. Computer Science and Engineering", "school": "College name", "place": "City",
  "period": "2022 – 2026", "grade": "CGPA 8.00" }

// experience: dates drive the ordering, "current" = ongoing role
{ "id": "e1", "role": "Data Analyst Intern", "org": "Company", "start": "2026-01", "end": "", "current": true,
  "period": "Jan 2026 – Present", "tech": "Power BI, SQL", "pts": "Highlight one|Highlight two" }

// projects: description points are separated by a new line or a bullet
{ "id": "p1", "title": "Cracow Real Estate Price Prediction", "desc": "Point one\nPoint two",
  "tech": "Python,Pandas", "code": "https://github.com/...", "live": "", "img": "data:image/jpeg;base64,..." }

// achievements
{ "id": "a1", "title": "Data Analytics", "org": "Udemy", "date": "2025", "type": "Certificate", "link": "", "img": "" }
```

**Ordering rules:** education by finishing year, experience with ongoing roles first and then by end and start date, achievements by date. All newest first, with undated items last. Older free-text dates (for example `"Nov 2025 – Feb 2026"` or `"2023"`) are parsed automatically.

Uploaded images are resized to 640px in the browser and stored in the JSON (limit about 2 MB per item). Contact messages live in their own table with `name`, `email`, `subject` (the role or topic), `message`, `created_at` and `seen`.

## API reference

Base URL: `http://localhost:8000`. Owner endpoints require the header `X-Admin-Key: <ADMIN_KEY>`. Interactive docs: `/docs`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/content/{collection}` | Public | List items (`skills`, `education`, `experience`, `projects`, `ach`) |
| PUT | `/api/content/{collection}/{id}` | Owner | Create or update an item (JSON object, up to 2 MB) |
| DELETE | `/api/content/{collection}/{id}` | Owner | Delete an item |
| POST | `/api/contact` | Public | Submit a message (validated) |
| GET | `/api/messages` | Owner | List messages, newest first |
| PUT | `/api/messages/{id}/seen` | Owner | Body `{"seen": true}`: mark read or unread |
| POST | `/api/messages/seen-all` | Owner | Mark every message read |
| DELETE | `/api/messages/{id}` | Owner | Delete a message |
| GET | `/api/auth` | Owner | `204` if the key is valid |
| GET | `/health` | Public | Liveness check (no database) |

**Status codes:** `200`/`201`/`204` success, `400` invalid id or payload, `401` missing or wrong key, `404` unknown collection or message, `422` validation error (field details returned).

```bash
curl -X PUT http://localhost:8000/api/content/skills/k9 \
  -H "X-Admin-Key: $ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"head":"Cloud","items":["Docker","Render"]}'

curl -X POST http://localhost:8000/api/contact -H "Content-Type: application/json" \
  -d '{"name":"Ada","email":"ada@example.com","subject":"Data Analyst role","message":"Hello!"}'
```

## Email notifications

Optional: with no key set, the app logs "Email notifications are off" and works normally.

1. Create a free account at [resend.com](https://resend.com) using the email address where you want notifications.
2. Create an API key (`re_...`).
3. Set `RESEND_API_KEY` and `NOTIFY_EMAIL` (your Resend account email) in the backend environment.

The default sender `onboarding@resend.dev` only delivers to your own Resend account email, which is enough for owner notifications. Sending runs in a background task and a failure is only logged, so it can never break the contact form. The email sets **Reply-To** to the visitor, so replying from your mailbox answers them directly.

## Deployment

### Database
Create a managed MySQL database (any provider) and note its connection URL. Tables are created on startup. If your provider requires SSL, add its option to the URL (commonly `?ssl_ca=/etc/ssl/certs/ca-certificates.crt`). Do not rely on SQLite on a free host: its disk is wiped on redeploy.

### Backend on Render
1. **New → Web Service**, connect the repository, root directory `backend`.
2. Runtime **Docker** (uses the included Dockerfile), or Python with build command `pip install -r requirements.txt` and start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
3. Environment variables: `ADMIN_KEY`, `DATABASE_URL`, `CORS_ORIGINS` (your exact Vercel URL, no trailing slash), plus the optional email variables.
4. Set the health check path to `/health`. Check the logs for "Application startup complete".

### Frontend on Vercel
1. **Add New → Project**, import the repository, root directory `frontend`, framework **Vite**.
2. Environment variables: `VITE_API_URL` (your Render URL) and `VITE_RESUME_FILE_ID`.
3. Deploy, and redeploy after changing any environment variable.

### Cold starts on free hosting
A free Render service sleeps when idle and can take about a minute to wake. The site shows its built-in content immediately and syncs when the API responds. To keep it awake, add a free uptime monitor (for example UptimeRobot) that requests `/health` every 5 minutes.

## Security

- **Owner key:** every write and the inbox require `X-Admin-Key`, checked on the server in constant time. The app refuses to start with a missing or short key.
- **No secrets in git:** configuration comes from environment variables or the git-ignored `.env`.
- **CORS** is limited to the origins you configure.
- **Validation:** contact fields are validated and size-limited, collection names and ids are whitelisted, and stored content must be a JSON object under 2 MB.
- **Emails are escaped:** message content is HTML-escaped before it goes into notification emails.
- Use HTTPS and a long random `ADMIN_KEY` in production.
- The phone number and email on the site are public by design (contact section).

**Known limitations:** the owner key is a single shared secret (no accounts, no expiry), and there is no rate limiting on the contact form yet.

## Performance and responsiveness

- The 3D scene uses one instanced mesh, a low pixel ratio, a 30 fps cap on touch devices, pauses when the tab is hidden and renders a single frame for reduced-motion users.
- Phone address-bar resizes do not re-allocate the 3D canvas, and heavy blur effects were avoided in scrolling areas.
- No horizontal scrolling (`overflow-x: clip`, `100svh` hero), and the navbar collapses to a menu on small screens.
- Fixed-size project cards keep the layout stable. Images load lazily.

## Testing

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

The tests cover public reads, 401 without a key, upsert ordering and delete, id and collection validation, contact validation and the full inbox flow (seen, seen-all, delete).

**Manual checklist before a release**
1. Owner login works, and add, edit and delete keep their changes after a refresh.
2. Education, experience and achievements sort newest first even when entered out of order.
3. The contact form saves a message, the inbox shows it, and the notification email arrives.
4. Opening a message lowers the unread count, and it stays read after a reload.
5. Resume preview, download and open-in-new-tab work.
6. No sideways scrolling and smooth scrolling on a phone.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| CORS error in the browser | `VITE_API_URL` points to the wrong port, or `CORS_ORIGINS` does not list your frontend origin. Restart both servers after changing env files. |
| `Configuration error: set the ADMIN_KEY ...` on startup | `ADMIN_KEY` is missing or shorter than 8 characters. |
| `Access denied` / cannot connect to MySQL | Check `DATABASE_URL` (user, password, host, database) and that MySQL is running. |
| Inbox says the server rejected your key | Use "Exit owner mode" in the footer and log in again with the current `ADMIN_KEY`. |
| Inbox says it can't reach the server (production) | The free host is waking up. Press refresh after a few seconds. |
| No notification email | Check the log for "Notification email failed". With `onboarding@resend.dev`, `NOTIFY_EMAIL` must match your Resend account email. |
| Resume preview is blank | The Drive file is not shared as **Anyone with the link**. |
| Contact message only saved in the browser | The API was unreachable (for example asleep). Add an uptime monitor on `/health`. |

## Roadmap

- Rate limiting and a honeypot field on the contact endpoint
- Replace the shared key with accounts and JWT
- Image storage on Cloudinary or S3 instead of data URLs
- Alembic migrations, CI pipeline (lint, test, build)

## Author

**Ajay Kumar Reddy** · Data Analyst and Power BI Analyst · Madanapalle, India

[LinkedIn](https://www.linkedin.com/in/ajayreddy8691) · [GitHub](https://github.com/ajayreddy8691) · ajayreddy8691@gmail.com

---

© 2026 Ajay Kumar Reddy. All rights reserved unless a `LICENSE` file states otherwise.

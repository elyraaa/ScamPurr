# ScamPurr AI 🐱

> AI-powered cat adoption scam detection platform — Coding.Kitty Hackathon 2026

ScamPurr AI analyzes suspicious cat adoption listings and shelter websites, then returns an **explainable scam risk score** powered by machine learning and cybersecurity heuristics.

![Risk: CRITICAL](https://img.shields.io/badge/CRITICAL-🙀%2090%2F100-red)
![Risk: LOW](https://img.shields.io/badge/LOW-😺%208%2F100-brightgreen)
![Tech: FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)
![Tech: React](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61dafb)

---

## Features

| Feature | Status |
|---------|--------|
| User authentication (Firebase / Demo) | ✅ |
| Adoption listing text analysis (AI) | ✅ |
| Shelter website URL analysis | ✅ |
| Combined risk score (listing + URL) | ✅ |
| Explainable results dashboard | ✅ |
| Analysis history | ✅ |
| Mock mode (works without any API keys) | ✅ |

---

## Tech Stack

**Frontend**: React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Framer Motion, React Router, TanStack Query, React Hook Form, Zod, Axios, Lucide React

**Backend**: FastAPI, Python 3.11/3.12, Pydantic v2, Pydantic Settings, SQLAlchemy, Alembic, Uvicorn

**AI/ML**: Scikit-learn Random Forest, TF-IDF vectorization, pandas, NumPy, NLTK, joblib model serialization

**Cybersecurity**: WHOIS checks, SSL certificate validation, HTTP metadata checks, optional Google Safe Browsing API, optional VirusTotal API

**Auth**: Firebase Authentication with demo-mode bypass for local development and hackathon demos

**Database**: SQLite for local development, PostgreSQL for production using Neon or another hosted Postgres provider

**Deployment**: Vercel for the frontend, Render for the FastAPI backend

---

## Quick Start (Local Development)

### Prerequisites

- Python 3.11 or 3.12
- Node.js 18+
- Git

### 1. Open the project

```powershell
cd "C:\..."
```

### 2. Run the app

```powershell
.\backend\.venv\Scripts\python.exe server.py
```

### First-time setup only

If you are setting up from a fresh clone, run this once:

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe scripts\seed_demo.py
.\.venv\Scripts\python.exe scripts\train_model.py

cd ..\frontend
npm install
Copy-Item .env.example .env

cd ..
.\backend\.venv\Scripts\python.exe server.py
```

---## Demo Flow

1. Open http://localhost:5173
2. Click **Try Demo Mode** on the login page (no Firebase setup needed)
3. On the dashboard, click **Analyze Listing**
4. Use the sample buttons:
   - **🙀 Scam Example** → should return CRITICAL risk
   - **😺 Legit Example** → should return LOW risk
5. Explore the explainability breakdown on the Result page
6. Try **URL Check** with the sample URLs
7. View your analysis history

---

## Configuration

### Backend `.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `USE_SQLITE` | `true` | Use SQLite instead of Postgres |
| `DATABASE_URL` | `sqlite:///./scampurr.db` | Database connection string |
| `FIREBASE_MOCK_AUTH` | `true` | Skip Firebase token verification |
| `USE_MOCK_ML` | `true` | Use keyword scorer (no model needed) |
| `USE_MOCK_URL` | `true` | Use pattern-based URL scoring |
| `GOOGLE_SAFE_BROWSING_API_KEY` | — | Enable real Safe Browsing checks |
| `VIRUSTOTAL_API_KEY` | — | Enable real VirusTotal checks |

### Frontend `.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend URL |
| `VITE_DEMO_MODE` | `true` | Bypass Firebase auth |
| `VITE_FIREBASE_*` | — | Firebase project config |

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | No | Health check |
| `POST` | `/auth/verify` | No | Firebase token → DB user |
| `POST` | `/analyses/listing` | Yes | Analyze listing text |
| `POST` | `/analyses/url` | Yes | Analyze shelter URL |
| `GET` | `/analyses/history` | Yes | User's analysis history |
| `GET` | `/analyses/{id}` | Yes | Get analysis result |

Full interactive docs: http://localhost:8000/docs

---

## Enabling Real APIs (Optional)

### Firebase Authentication

1. Create project at https://console.firebase.google.com
2. Enable Authentication → Google Sign-in
3. Download service account JSON key
4. Set in backend `.env`:
   ```
   FIREBASE_MOCK_AUTH=false
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
   ```
5. Set in frontend `.env`:
   ```
   VITE_DEMO_MODE=false
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   ```

### Google Safe Browsing API

1. Enable at https://console.cloud.google.com/apis/library/safebrowsing.googleapis.com
2. Create API key
3. Set `GOOGLE_SAFE_BROWSING_API_KEY=your-key` in backend `.env`
4. Set `USE_MOCK_URL=false`

### VirusTotal API

1. Register at https://www.virustotal.com
2. Get API key from profile settings
3. Set `VIRUSTOTAL_API_KEY=your-key` in backend `.env`

### Real ML Model (Random Forest)

The project now supports CSV-based model training. Edit this file with more examples:

```text
backend/data/training_examples.csv
```

Required columns:

```csv
text,label
"Free kitten, pay shipping by gift card",1
"Licensed shelter, meet in person, vet records included",0
```

Train or retrain the model:

```powershell
cd backend
.\.venv\Scripts\python.exe scripts\train_model.py
```

The trained model is saved to:

```text
backend/model/scam_classifier.pkl
```

Use real ML mode in `backend/.env`:

```env
USE_MOCK_ML=false
MODEL_PATH=model/scam_classifier.pkl
```

---

## Production Deployment

### Backend: Render

This repo includes `render.yaml` for a Render web service. Render should use:

```bash
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Root Directory: backend
```

Set these Render environment variables:

```env
USE_SQLITE=false
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@HOST/DBNAME
FIREBASE_MOCK_AUTH=true
USE_MOCK_ML=false
MODEL_PATH=model/scam_classifier.pkl
USE_MOCK_URL=true
DEBUG=false
CORS_ORIGINS=["https://your-vercel-app.vercel.app"]
```

### Frontend: Vercel

Deploy the `frontend` folder as a Vite app. Use:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Set these Vercel environment variables:

```env
VITE_API_BASE_URL=https://your-render-backend.onrender.com
VITE_DEMO_MODE=true
VITE_DEMO_TOKEN=demo-user-1
```

### Database: Neon or Supabase Postgres

For a deployed website, use Postgres instead of SQLite. Create a free Neon or Supabase database, copy the connection string, and set it as Render's `DATABASE_URL`.

### Optional Real Services

- Firebase Auth: set `FIREBASE_MOCK_AUTH=false` and `VITE_DEMO_MODE=false` after configuring Firebase.
- Google Safe Browsing: set `GOOGLE_SAFE_BROWSING_API_KEY` and `USE_MOCK_URL=false`.
- VirusTotal: set `VIRUSTOTAL_API_KEY`.

---
## Project Structure

```
scampurr-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── config.py            # Settings
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── deps.py              # Auth dependencies
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response
│   │   ├── routers/             # API route handlers
│   │   └── services/            # ML, URL, scoring, auth services
│   ├── scripts/
│   │   ├── train_model.py       # Train Random Forest classifier
│   │   └── seed_demo.py         # Seed demo data
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/               # Route page components
    │   ├── components/          # Reusable UI components
    │   ├── context/             # React context (AuthContext)
    │   ├── lib/                 # Firebase, Axios, utils
    │   └── types/               # TypeScript types
    ├── package.json
    └── .env.example
```

---

## Scoring System

```
combined_score = 0.55 × listing_score + 0.45 × url_score

Risk Labels:
  LOW       0–29    😺
  MEDIUM    30–59   🐱
  HIGH      60–79   😾
  CRITICAL  80–100  🙀
```

**Listing scam signals detected** (mock mode):
- Suspicious payment methods (wire transfer, gift cards, crypto)
- Shipping/transport/customs fee requests
- Artificial urgency language
- Religious manipulation tactics
- Sob stories (illness, military, divorce)
- Refusal to meet in person
- Missing veterinary documentation
- Free purebred listings

**URL trust checks** (mock mode):
- HTTPS presence
- Suspicious TLDs (.xyz, .tk, .ml)
- Free hosting detection (Wix, Weebly)
- Domain pattern analysis
- Simulated domain age estimation

---

## License

MIT — built for the Coding.Kitty Hackathon 2026 🐾

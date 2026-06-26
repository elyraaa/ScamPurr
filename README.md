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

**Frontend**: React 18 · TypeScript · TailwindCSS v4 · Framer Motion · React Hook Form · Zod · React Router · Axios

**Backend**: FastAPI · Python 3.12+ · Pydantic v2 · SQLAlchemy · Uvicorn

**AI/ML**: Scikit-Learn (Random Forest) · TF-IDF · NLTK · Pandas · NumPy

**Cybersecurity**: WHOIS · SSL validation · Google Safe Browsing API · VirusTotal API

**Auth**: Firebase Authentication (with demo bypass for local dev)

**Database**: SQLite (local) · PostgreSQL/Neon (production)

---

## Quick Start (Local Development)

### Prerequisites

- Python 3.12+ (check with `py --version` on Windows)
- Node.js 18+ (check with `node --version`)
- Git

### 1. Open the project

```powershell
cd "C:\Users\Vincent Santos\.gemini\antigravity-ide\scratch\scampurr-ai"
```

If you cloned the project somewhere else, run the same command from your own `scampurr-ai` folder.

### 2. Run the app

```powershell
.\backend\venv\Scripts\python.exe server.py
```

This single command starts both local servers:

- Backend API: http://localhost:8000
- Backend API docs: http://localhost:8000/docs
- Frontend app: http://localhost:5173

Press `Ctrl+C` in the terminal to stop both servers.

### First-time setup only

The checked-in local scratch project already includes `backend\venv`, `frontend\node_modules`, and `.env` files. If you are setting up from a fresh clone, run these once before `.\backend\venv\Scripts\python.exe server.py`:

```powershell
cd backend
py -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\venv\Scripts\python.exe scripts\seed_demo.py

cd ..\frontend
npm install
Copy-Item .env.example .env

cd ..
.\backend\venv\Scripts\python.exe server.py
```

---
## Demo Flow

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

```bash
cd backend
venv\Scripts\activate
python scripts/train_model.py  # Generates model/scam_classifier.pkl
```

Then set `USE_MOCK_ML=false` in `.env`.

---

## Production Deployment

### Backend → Render

1. Push to GitHub
2. Create new Render Web Service
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Set all env vars in Render dashboard

### Frontend → Vercel

1. Import GitHub repo to Vercel
2. Framework: Vite
3. Build: `npm run build`
4. Set `VITE_API_BASE_URL` to your Render backend URL

### Database → Neon PostgreSQL

1. Create database at https://neon.tech
2. Copy connection string
3. Set in Render: `DATABASE_URL=postgresql+psycopg2://...` and `USE_SQLITE=false`

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

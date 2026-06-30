# ScamPurr AI

AI-powered cat adoption scam detection platform built for the Coding.Kitty Hackathon 2026.

ScamPurr AI analyzes cat adoption listing text and shelter/listing URLs, then returns an explainable scam risk score.

## Features

- Firebase authentication for production sign-in
- Local placeholder email authentication for development
- Guest listing and URL checks without saved user history
- Adoption listing scam analysis
- Shelter/listing URL trust analysis
- Combined listing + URL risk scoring
- Explainable risk factors and labels
- User dashboard and saved analysis history
- Public aggregate URL check counter
- Basic request rate limiting
- Listing text and URL input size validation
- Privacy notice page
- PostgreSQL support for production
- SQLite support for local development
- Trained scikit-learn model support

## Tech Stack

**Frontend**

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS v4
- React Router
- TanStack Query
- React Hook Form
- Zod
- Axios
- Firebase Web SDK
- Framer Motion
- Lucide React

**Backend**

- FastAPI
- Python 3.11 or 3.12
- Pydantic v2
- Pydantic Settings
- SQLAlchemy
- Alembic
- Uvicorn
- Firebase Admin SDK
- In-memory API rate limiting

**Machine Learning**

- scikit-learn
- TF-IDF vectorization
- Random Forest classifier
- pandas
- NumPy
- NLTK
- joblib

**Security and URL Analysis**

- Firebase ID token verification
- WHOIS checks
- SSL certificate checks
- Optional Google Safe Browsing API
- Optional VirusTotal API

**Deployment**

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

## Local Installation

### Prerequisites

- Python 3.11 or 3.12
- Node.js 18 or newer
- Git

### 1. Clone and open the project

```powershell
git clone <repo-url>
cd scampurr-ai
```

### 2. Set up the backend

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe scripts\train_model.py
cd ..
```

### 3. Set up the frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
cd ..
```

## Running Locally

Run both backend and frontend with one command from the project root:

```powershell
.\backend\.venv\Scripts\python.exe server.py
```

Local URLs:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

Stop both servers with `Ctrl+C`.

## Local Flow

1. Open http://localhost:5173
2. Use any placeholder email and password on the login page.
3. Run a listing analysis or URL analysis.
4. Open the result page to review the score and explanations.
5. Log in to save history, or use the analysis pages while logged out for unsaved guest checks.

## Local Validation

Run backend schema tests:

```powershell
cd backend
.\.venv\Scripts\python.exe -m unittest discover -s tests
cd ..
```

Run frontend checks:

```powershell
cd frontend
npm run lint
npm run build
cd ..
```

## Model Training

Training data lives in:

```text
backend/data/training_examples.csv
```

CSV format:

```csv
text,label
"Free kitten, pay shipping by gift card",1
"Licensed shelter, meet in person, vet records included",0
```

Labels:

- `1` means scam
- `0` means legitimate

Train or retrain the model:

```powershell
cd backend
.\.venv\Scripts\python.exe scripts\train_model.py
cd ..
```

The trained model is saved to:

```text
backend/model/scam_classifier.pkl
```

## Deployment

Frontend:

```text
https://scam-purr.vercel.app/
```

Backend health:

```text
https://scampurr.onrender.com/health
```
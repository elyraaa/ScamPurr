# ScamPurr AI

ScamPurr AI is a cat adoption scam detection platform built for the Coding.Kitty Hackathon 2026.

It analyzes adoption listing text and shelter/listing URLs, then returns an explainable risk score with trust signals and red flags.

## Working Features

- Google sign-in with Firebase Authentication
- Email/password account creation with email verification
- Password reset
- Guest listing and URL checks without saved user history
- Saved analysis history for signed-in users
- Adoption listing scam analysis
- Shelter/listing URL trust analysis
- Combined listing and URL scoring
- Explainable risk factors and labels
- Cat adoption relevance warnings for unrelated text or URLs
- Public aggregate URL check counter
- Backend rate limiting
- Listing text and URL validation
- PostgreSQL in production and SQLite locally
- Trainable scikit-learn model

## Tech Stack

**Frontend**

- React
- TypeScript
- Vite
- Tailwind CSS
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
- Pydantic
- Pydantic Settings
- SQLAlchemy
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

**URL Analysis**

- WHOIS checks
- SSL certificate checks
- Optional Google Safe Browsing API
- Optional VirusTotal API
- Rule-based fallback scoring

**Deployment**

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL
- Authentication: Firebase

## Local Installation

### Prerequisites

- Python 3.11 or 3.12
- Node.js 18 or newer
- Git

### 1. Clone And Open The Project

```powershell
git clone <repo-url>
cd scampurr-ai
```

### 2. Set Up The Backend

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe scripts\train_model.py
cd ..
```

Create `backend/.env` if you need local overrides:

```env
DATABASE_URL=sqlite:///./scampurr.db
USE_SQLITE=true
FIREBASE_MOCK_AUTH=true
USE_MOCK_ML=false
USE_MOCK_URL=true
MODEL_PATH=model/scam_classifier.pkl
CORS_ORIGINS=http://localhost:5173
```

### 3. Set Up The Frontend

```powershell
cd frontend
npm install
cd ..
```

Create `frontend/.env` for local development:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_LOCAL_AUTH=true
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
2. Continue as guest, or sign in.
3. Run a listing analysis, URL analysis, or combined analysis.
4. Open the result page to review the score and explanations.
5. Signed-in analyses are saved to history. Guest analyses are not saved to user history.

## Local Validation

Run backend tests:

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

Retrain the model:

```powershell
cd backend
.\.venv\Scripts\python.exe scripts\train_model.py
cd ..
```

The trained model is saved to:

```text
backend/model/scam_classifier.pkl
```

## Production URLs

Frontend:

```text
https://scam-purr.vercel.app/
```

Backend health:

```text
https://scampurr.onrender.com/health
```

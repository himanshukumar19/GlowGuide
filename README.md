# GlowGuide — AI Skin Analysis App

A full-stack AI-powered skin type analysis app using a trained ML model (RandomForest), a Node.js backend, and a React frontend.

---

## 🏗️ Project Structure

```
GlowGuide/
├── ML-Service/          ← Python FastAPI + RandomForest model
├── Backend/             ← Node.js + Express + TypeScript API
├── Frontend/            ← React + Vite + TypeScript + TailwindCSS
├── docker-compose.yml   ← (upcoming) local orchestration
└── README.md
```

---

## ✅ Completed

### ML Service
- [x] RandomForest model trained on 24 features
- [x] FastAPI server with `/predict` endpoint
- [x] 7 quiz answers → 17 derived features → skin type prediction
- [x] NLP keyword adjustment from free text
- [x] Multi-stage Dockerfile (train + serve)
- [x] Docker image built and tested (`glowguide-ml`)

### Backend
- [x] Express + TypeScript server
- [x] `POST /api/skin-analysis` — receives quiz answers, forwards to ML service
- [x] `GET /api/health` — health check endpoint
- [x] CORS configured
- [x] Environment variables via `.env`
- [x] Tested locally on port 3001

### Frontend
- [x] 7-question skin quiz (Vite + React + TypeScript)
- [x] Connected to Backend API (`VITE_API_URL` env var)
- [x] Real ML predictions displayed as results
- [x] Loading state (`"Analyzing..."`) during API call
- [x] Free text (skin notes) sent to ML for NLP analysis
- [x] End-to-end flow working ✅

---

## 🔄 Upcoming Tasks

### Step 1 — Backend Dockerfile
- [ ] Create `Backend/Dockerfile`
- [ ] Multi-stage: install deps → build TypeScript → run compiled JS
- [ ] Test: `docker build -t glowguide-backend ./Backend`

### Step 2 — docker-compose.yml (root folder)
- [ ] Create `docker-compose.yml` with 3 services:
  - `ml-service` (port 8000)
  - `backend` (port 3001) — depends on ml-service health
  - `frontend` (port 8081) — depends on backend
- [ ] Add health checks
- [ ] Test: `docker-compose up --build`

### Step 3 — Frontend Dockerfile (for docker-compose only)
- [ ] Create `Frontend/Dockerfile`
- [ ] Build Vite app → serve with nginx
- [ ] Note: NOT needed for Vercel deployment

### Step 4 — Deploy ML Service to Render
- [ ] Push code to GitHub
- [ ] Create Render account → New Web Service → Docker
- [ ] Root directory: `ML-Service`
- [ ] Set environment variables (if any)
- [ ] Save URL: `https://glowguide-ml.onrender.com`

### Step 5 — Deploy Backend to Render
- [ ] New Render Web Service → Docker
- [ ] Root directory: `Backend`
- [ ] Environment variables:
  ```
  PORT=3001
  ML_SERVICE_URL=https://glowguide-ml.onrender.com
  FRONTEND_URL=https://glowguide.vercel.app
  ```
- [ ] Save URL: `https://glowguide-backend.onrender.com`

### Step 6 — Deploy Frontend to Vercel
- [ ] Connect GitHub repo to Vercel
- [ ] Framework: Vite
- [ ] Root directory: `Frontend`
- [ ] Environment variables:
  ```
  VITE_API_URL=https://glowguide-backend.onrender.com
  ```
- [ ] Save URL: `https://glowguide.vercel.app`

### Step 7 — Keep-Alive (Render free tier)
- [ ] Sign up at UptimeRobot (free)
- [ ] Add monitors for ML Service + Backend URLs
- [ ] Ping every 5 minutes (prevents Render free tier sleep)

---

## 🚀 Phase 2 — After Deployment (Future)

### Enhanced UI
- [ ] Loading animation (DNA helix 🧬) during prediction
- [ ] Animated confidence meter in results
- [ ] Probability bars for all 5 skin types
- [ ] Show `concerns_detected` from ML NLP response

### User Authentication (Phase 3)
- [ ] Firebase Auth (Email + Google Sign-In)
- [ ] Protected quiz route
- [ ] User profile page

### Database (Phase 4)
- [ ] PostgreSQL on Render
- [ ] Prisma ORM
- [ ] Models: User, SkinAnalysis
- [ ] Save quiz results per user
- [ ] Analysis history page

### Product Recommendations (Phase 5)
- [ ] Product database seeded per skin type
- [ ] Recommendation algorithm
- [ ] Product cards in results page
- [ ] Amazon affiliate links

### PDF Report (Phase 6)
- [ ] Generate downloadable PDF after analysis
- [ ] Include skin type, confidence, tips, routine

---

## 🛠️ Local Development

### Run all services:

**Terminal 1 — ML Service:**
```bash
docker run -p 8000:8000 glowguide-ml
```

**Terminal 2 — Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 3 — Frontend:**
```bash
cd Frontend
npm run dev
```

App runs at: `http://localhost:8081`

---

## 🌐 Environment Variables

### Backend `.env`
```
PORT=3001
ML_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:8081
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:3001
```

---

## 🔑 Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| ML Model | RandomForest (200 trees) | Best accuracy on tabular skin data |
| Features | 24 total (7 quiz + 17 derived) | More data = better accuracy |
| Backend | Node.js + Express + TypeScript | Simple proxy, easy to extend |
| Frontend | React + Vite + TailwindCSS | Fast builds, modern tooling |
| ML Deploy | Render (Docker) | Free tier, Docker support |
| Frontend Deploy | Vercel | Best for Vite/React apps |
| Keep-alive | UptimeRobot | Prevents Render free tier sleep |

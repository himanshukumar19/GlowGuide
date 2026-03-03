# GlowGuide — Progress Tracker

## ✅ Completed

### ML Service
- [x] `requirements.txt` — fastapi, uvicorn, scikit-learn, numpy, joblib, pandas
- [x] `train.py` — RandomForestClassifier on all 24 CSV features, saves `model.pkl` + `label_encoder.pkl`
- [x] `main.py` — FastAPI server, 7 quiz answers → derives 17 features → 24 total → prediction + NLP text processing
- [x] `Dockerfile` — Multi-stage build (Stage 1: train, Stage 2: serve)

### Frontend Quiz
- [x] `quizData.ts` — Redesigned to 7 questions, new interfaces (QuizOption, QuizQuestion, QuizAnswers)
- [x] `SkinQuiz.tsx` — Updated for new data types, emoji + importance badges, sublabels, helpText
- [x] Optional free text input — collapsed by default, expands on toggle, 200 char limit
- [x] "See My Results" button appears after last question option is selected

---

## 🔄 In Progress

### ML Service
- [ ] `docker build -t glowguide-ml .` — build and test locally
- [ ] `docker run -p 8000:8000 glowguide-ml` — verify `/` and `/predict` endpoints

---

## ⬜ Upcoming

### Step 1 — Docker Test (next)
```bash
cd ML-Service
docker build -t glowguide-ml .
docker run -p 8000:8000 glowguide-ml
# Test: curl http://localhost:8000/
```

### Step 2 — Backend (`/Backend` folder)
- [ ] `package.json` — Node.js + Express + TypeScript
- [ ] `server.ts` — Express app, CORS, error handling
- [ ] `/api/skin-analysis` route — receives quiz answers from frontend, calls ML service, returns result
- [ ] `tsconfig.json`
- [ ] `Dockerfile` for backend

### Step 3 — `docker-compose.yml` (root folder)
- [ ] ml-service (port 8000)
- [ ] backend (port 3001)
- [ ] frontend (port 3000)
- [ ] Health checks + service dependencies

### Step 4 — Connect Frontend to Backend
- [ ] Update `SkinQuiz.tsx` — send quiz answers to `/api/skin-analysis` instead of local `getSkinTypeFromAnswers()`
- [ ] Handle loading state during API call
- [ ] Handle errors (ML service down, etc.)

### Step 5 — Deploy
- [ ] ML Service → Render (Docker)
- [ ] Backend → Render (Node.js)
- [ ] Frontend → Vercel
- [ ] Set environment variables on each platform
- [ ] UptimeRobot setup → ping every 5 min to prevent Render free tier sleep

### Step 6 — Phase 2 (after deployment working)
- [ ] Loading animation during prediction (DNA helix 🧬)
- [ ] Confidence meter animation in results
- [ ] Probability bars for all skin types

---

## 📁 File Structure (current)

```
GlowGuide/
├── Frontend/
│   └── src/
│       ├── data/quizData.ts        ✅
│       ├── pages/SkinQuiz.tsx      ✅
│       └── ...
├── ML-Service/
│   ├── data/
│   │   └── ultimate_skin_type_dataset.csv
│   ├── model/                      (generated after docker build)
│   │   ├── model.pkl
│   │   └── label_encoder.pkl
│   ├── train.py                    ✅
│   ├── main.py                     ✅
│   ├── requirements.txt            ✅
│   └── Dockerfile                  ✅
├── Backend/                        ⬜ not created yet
├── docker-compose.yml              ⬜ not created yet
└── IMPLEMENTATION_ROADMAP.md
```

---

## 🔑 Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| ML Model | RandomForestClassifier (200 trees) | Best accuracy on tabular skin data |
| Features | All 24 CSV features | More data = better accuracy |
| Quiz → Model | 7 quiz answers, 17 derived | User fills 7, rest calculated from correlations |
| Free text | NLP keyword matching | Adjusts feature values before prediction |
| Deployment | Render (ML + Backend) + Vercel (Frontend) | Free tier available, Docker support |
| Keep-alive | UptimeRobot ping every 5 min | Prevents Render free tier sleep |

---

## 🌐 Deployment URLs (fill after deploy)

| Service | URL |
|---|---|
| ML Service | `https://________________.onrender.com` |
| Backend | `https://________________.onrender.com` |
| Frontend | `https://________________.vercel.app` |

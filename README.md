# Yatra IQ — "Know the crowd before you board."

> **Hack Fusion '26 Production-Quality Prototype**

Yatra IQ is a privacy-preserving, AI-powered public transport crowd prediction and smart route recommendation system. It processes anonymous device presence telemetry to predict future passenger density, recommend optimal comfortable journeys for commuters, and enable transport operators to proactively deploy capacity before overcrowding occurs.

---

## 1. Problem Statement

Commuters board public transit blindly — without knowing passenger density, crowd surges, or seat availability. Meanwhile, transport operators react to overcrowding *after* it happens rather than pre-empting it. Traditional camera surveillance raises severe privacy concerns, while personal GPS tracking incurs high battery and privacy costs.

## 2. Solution & Core Innovation

CrowdSense AI bridges this gap through a non-visual, privacy-by-design pipeline:

```
Anonymous Device Telemetry → AI Calibration → Passenger Occupancy → CrowdPredict (5/10/15m) → SmartRoute → FleetAI
```

1. **DeviceSense™:** Camera-free anonymous device-presence detection.
2. **CrowdPredict™:** 5, 10, and 15-minute future crowd forecasting using XGBoost / Random Forest.
3. **SmartRoute™:** Multi-factor Travel Score algorithm recommending comfortable travel options.
4. **FleetAI™:** Real-time overcrowding alerts and operator capacity deployment.
5. **Privacy by Design:** Zero personal identities, names, phone numbers, or device contents collected.

---

## 3. Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, Leaflet / React Leaflet, Recharts, Lucide React, Socket.IO Client.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Socket.IO, JWT, Zod.
- **AI Service:** Python 3.11, FastAPI, pandas, numpy, scikit-learn, XGBoost / RandomForest, joblib.
- **Simulator:** Node.js / TypeScript configurable telemetry engine.
- **DevOps:** Docker Compose, Concurrently.

---

## 4. Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Passenger** | `passenger@crowdsense.demo` | `Demo@2026` |
| **Operator** | `operator@crowdsense.demo` | `Demo@2026` |
| **Admin** | `admin@crowdsense.demo` | `Demo@2026` |

---

## 5. Quick Start (Running Locally)

### Prerequisites
- Node.js 18+ and `npm`
- PostgreSQL (or Docker Desktop)
- Python 3.8+ (optional, fallback AI engine included in Node.js backend)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to backend `.env`:
```bash
cp .env.example backend/.env
```

### Step 3: Initialize Database & Seed Data
```bash
npm run db:migrate
npm run db:seed
```

### Step 4: Run Application
```bash
npm run dev
```
This starts:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- Simulator Engine: background service

*(Optional)* Start Python AI Service in another terminal:
```bash
npm run install:ai
npm run dev:ai
```

---

## 6. Hackathon Demo Mode

Navigate to `/simulator` in the application UI or click **"Try Live Demo"**.
Click **"START DEMO MODE"** to execute an automated 8-phase live presentation sequence demonstrating:
1. Normal baseline (48% occupancy)
2. Rising passenger count (65%)
3. Crowd surge (82%)
4. AI prediction of 92%+ overcrowding in 10 minutes
5. Automated critical overcrowding alert
6. Operator deploying additional fleet capacity
7. Passenger redistribution (71%)
8. System stabilization & SmartRoute recommendation update

---

## 7. Mandatory Technical & Privacy Disclaimer

> **The hackathon prototype uses simulated/controlled device telemetry. Real-world deployment would require appropriate operator-controlled sensing infrastructure, platform compatibility, privacy safeguards, and applicable permissions.**

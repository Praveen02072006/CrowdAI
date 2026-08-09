# 🚌 Yatra IQ — Smart Transit Crowd Analytics & Prediction

> *"Know the crowd before you board."*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://crowd-ai-frontend-eta.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

Yatra IQ is an AI-powered, privacy-preserving public transport crowd prediction and smart route recommendation platform. It analyzes non-visual device telemetry to predict future passenger density, recommend comfortable travel options for commuters, and empower transport operators to dynamically deploy fleet capacity before overcrowding occurs.

---

## 🌐 Live Production Link

| Resource | URL | Status |
|---|---|---|
| **Web Application (Vercel)** | [https://crowd-ai-frontend-eta.vercel.app/](https://crowd-ai-frontend-eta.vercel.app/) | ![Online](https://img.shields.io/badge/Status-Online-brightgreen) |

---

## 🔑 Quick Demo Credentials

Test the platform instantly with pre-configured role-based accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| 👤 **Passenger** | `passenger@crowdsense.demo` | `Demo@2026` | Commuter travel search, occupancy view & SmartRoute recommendations |
| 🚍 **Operator** | `operator@crowdsense.demo` | `Demo@2026` | Real-time fleet monitor, overcrowding alerts & capacity deployment |
| 🛡️ **Admin** | `admin@crowdsense.demo` | `Demo@2026` | Full platform metrics, AI configuration & system telemetry |

*Tip: You can also use the **Quick Demo Access** buttons directly on the Sign In page.*

---

## ⚡ Key Features

* **DeviceSense™ (Privacy-First Density Estimation):** Camera-free, non-visual device presence analytics. Zero facial recognition, zero identity tracking, zero personal data stored.
* **CrowdPredict™ (ML Forecasting Engine):** 5, 10, and 15-minute predictive passenger density forecasting using trained Machine Learning models (XGBoost / Random Forest).
* **SmartRoute™ (Comfort-Based Routing):** Multi-factor Travel Score algorithm evaluating predicted crowd level, seat probability, wait times, and travel duration.
* **FleetAI™ (Operator Command Center):** Real-time fleet management dashboard with automated overcrowding alerts and 1-click capacity dispatch.
* **Interactive Live Map:** Real-time vehicle location tracking with live occupancy badges and route overlays.
* **Real-time WebSockets:** Powered by Socket.IO for instant telemetry updates and live alert push notifications.
* **8-Phase Telemetry Simulator:** Built-in interactive presentation mode for live hackathon demonstrations.

---

## 🏗️ System Architecture

```
┌─────────────────────────┐       Socket.IO / REST       ┌──────────────────────────┐
│  React 18 + Vite SPA    │ ◄──────────────────────────► │  Node.js + Express API   │
│  (Deployed on Vercel)   │                              │   (Deployed on Render)   │
└─────────────────────────┘                              └────────────┬─────────────┘
                                                                      │
                                                     ┌────────────────┴─────────────┐
                                                     │                              │
                                                     ▼                              ▼
                                          ┌────────────────────┐         ┌────────────────────┐
                                          │ Neon PostgreSQL    │         │ Python AI Engine   │
                                          │  (Prisma ORM)      │         │ (FastAPI / XGBoost)│
                                          └────────────────────┘         └────────────────────┘
```

### Data Pipeline
```
Anonymous Telemetry  ──►  DeviceSense Calibration  ──►  Occupancy Calculation  ──►  CrowdPredict Forecast (5/10/15m)  ──►  SmartRoute & FleetAI Dispatch
```

---

## 🛠️ Technology Stack

### **Frontend**
* **Framework:** React 18, Vite, TypeScript
* **Styling:** Tailwind CSS, Lucide React Icons
* **State & Data Fetching:** TanStack React Query, Axios
* **Maps & Visualizations:** Leaflet, React Leaflet, Recharts
* **Real-Time:** Socket.IO Client

### **Backend**
* **Runtime:** Node.js, Express, TypeScript
* **Database & ORM:** PostgreSQL (Neon Cloud), Prisma ORM
* **Real-Time & Auth:** Socket.IO, JWT Authentication, Zod Validation

### **AI & Simulation**
* **AI Engine:** Python 3.11, FastAPI, pandas, numpy, scikit-learn, XGBoost
* **Simulator:** Node.js / TypeScript automated telemetry generator

---

## 🚀 Local Development Setup

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher

### 1. Clone the Repository
```bash
git clone https://github.com/Praveen02072006/CrowdAI.git
cd CrowdAI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Local Database (SQLite Fallback)
```bash
npm run db:use:sqlite --workspace=backend
```
*(This initializes and seeds the local `dev.db` database automatically).*

### 4. Start Development Servers
```bash
npm run dev
```

This concurrently starts:
* 📱 **Frontend:** `http://localhost:5173`
* ⚙️ **Backend API:** `http://localhost:3001`
* 📡 **Telemetry Simulator:** Active background service

*(Optional)* Start the Python AI service in a separate terminal:
```bash
npm run install:ai
npm run dev:ai
```

---

## 🎭 Hackathon Demo Mode

1. Open the web app and navigate to `/simulator` (or click **"Device Simulator"** in the navigation header).
2. Click **"START DEMO MODE"**.
3. Watch the automated 8-phase live simulation sequence:
   1. **Phase 1: Baseline** (48% occupancy - LOW crowd)
   2. **Phase 2: Passenger Arrival** (65% occupancy - MODERATE)
   3. **Phase 3: Crowd Surge** (82% occupancy - CROWDED)
   4. **Phase 4: AI Prediction** (Forecasting >90% OVERLOADED in 10 minutes)
   5. **Phase 5: Automated Alert** (Operator notified of overcrowding)
   6. **Phase 6: Capacity Deployment** (Operator dispatches additional vehicle)
   7. **Phase 7: Passenger Load Re-balancing** (Occupancy drops to 71%)
   8. **Phase 8: System Stabilization** (SmartRoute score recovers)

---

## 🛡️ Privacy & Technical Disclaimer

> **Yatra IQ is designed with Privacy-by-Design principles.** The system relies on non-visual device count telemetry and does not collect, track, or store personal identities, MAC addresses, names, phone numbers, or device contents. The hackathon prototype uses controlled simulated device telemetry for demonstration purposes.

---

<p center="align">
  <b>Built for Hack Fusion '26</b> • Designed & Developed by Team Yatra IQ
</p>

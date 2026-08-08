import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
import pandas as pd
import joblib
from train import generate_synthetic_dataset, train_and_save_model

app = FastAPI(
    title="CrowdSense AI Service",
    description="FastAPI Service for anonymous device occupancy estimation & crowd prediction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "models/occupancy_model.pkl"
model = None

@app.on_event("startup")
def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        train_and_save_model()
    model = joblib.load(MODEL_PATH)
    print("🚀 AI Service model loaded into memory.")

class OccupancyRequest(BaseModel):
    device_count: int = Field(..., ge=0)
    hour: int = Field(12, ge=0, le=23)
    day_of_week: int = Field(1, ge=0, le=6)
    vehicle_capacity: int = Field(60, gt=0)
    boarding_rate: int = Field(0, ge=0)
    exit_rate: int = Field(0, ge=0)
    previous_occupancy: float = Field(50.0, ge=0, le=100)

class CrowdPredictionRequest(BaseModel):
    current_occupancy: float = Field(..., ge=0, le=100)
    hour: int = Field(12, ge=0, le=23)
    boarding_rate: int = Field(0, ge=0)
    exit_rate: int = Field(0, ge=0)

@app.get("/health")
def health():
    return {"status": "ok", "service": "CrowdSense AI Service", "model_loaded": model is not None}

@app.post("/predict/occupancy")
def predict_occupancy(req: OccupancyRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="AI Model not initialized")

    features = pd.DataFrame([{
        'device_count': req.device_count,
        'capacity': req.vehicle_capacity,
        'hour': req.hour,
        'day_of_week': req.day_of_week,
        'boarding_rate': req.boarding_rate,
        'exit_rate': req.exit_rate,
    }])

    raw_pred = model.predict(features)[0]
    estimated_passengers = int(np.clip(np.round(raw_pred), 0, req.vehicle_capacity))
    occupancy_percentage = round((estimated_passengers / req.vehicle_capacity) * 100, 1)

    confidence = round(float(np.clip(0.75 + (req.device_count / 100.0) * 0.18, 0.70, 0.95)), 2)

    return {
        "estimated_passengers": estimated_passengers,
        "occupancy_percentage": occupancy_percentage,
        "confidence": confidence,
        "capacity": req.vehicle_capacity,
        "source": "AI_FASTAPI"
    }

@app.post("/predict/crowd")
def predict_crowd(req: CrowdPredictionRequest):
    net_flow = req.boarding_rate - req.exit_rate
    peak_factor = 1.3 if ((req.hour >= 8 and req.hour <= 10) or (req.hour >= 17 and req.hour <= 20)) else 0.8
    trend = net_flow * peak_factor

    pred_5 = int(np.clip(np.round(req.current_occupancy + trend * 1.0), 0, 100))
    pred_10 = int(np.clip(np.round(req.current_occupancy + trend * 2.0), 0, 100))
    pred_15 = int(np.clip(np.round(req.current_occupancy + trend * 3.0), 0, 100))

    return {
        "current_occupancy": req.current_occupancy,
        "predictions": [
            {"horizon_minutes": 5, "predicted_occupancy": pred_5, "confidence": 0.88},
            {"horizon_minutes": 10, "predicted_occupancy": pred_10, "confidence": 0.82},
            {"horizon_minutes": 15, "predicted_occupancy": pred_15, "confidence": 0.76},
        ]
    }

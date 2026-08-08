import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

def generate_synthetic_dataset(num_samples=2000):
    np.random.seed(42)

    device_count = np.random.randint(5, 80, size=num_samples)
    capacity = np.random.choice([50, 60, 65, 70], size=num_samples)
    hour = np.random.randint(6, 23, size=num_samples)
    day_of_week = np.random.randint(0, 7, size=num_samples)
    boarding_rate = np.random.randint(0, 15, size=num_samples)
    exit_rate = np.random.randint(0, 15, size=num_samples)

    # True ratio model with realistic peak hour & weekend noise
    peak_mask = ((hour >= 8) & (hour <= 10)) | ((hour >= 17) & (hour <= 20))
    ratio = 1.05 + np.where(peak_mask, 0.18, 0.0) - np.where(day_of_week >= 5, 0.12, 0.0)
    noise = np.random.normal(0, 2.5, size=num_samples)

    estimated_passengers = np.clip(np.round(device_count * ratio + noise), 0, capacity)
    occupancy_percentage = np.clip(np.round((estimated_passengers / capacity) * 100), 0, 100)

    df = pd.DataFrame({
        'device_count': device_count,
        'capacity': capacity,
        'hour': hour,
        'day_of_week': day_of_week,
        'boarding_rate': boarding_rate,
        'exit_rate': exit_rate,
        'estimated_passengers': estimated_passengers,
        'occupancy_percentage': occupancy_percentage
    })
    return df

def train_and_save_model():
    print("🤖 Generating prototype synthetic dataset for CrowdSense AI...")
    df = generate_synthetic_dataset(3000)

    X = df[['device_count', 'capacity', 'hour', 'day_of_week', 'boarding_rate', 'exit_rate']]
    y = df['estimated_passengers']

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    preds = model.predict(X)
    mae = mean_absolute_error(y, preds)
    rmse = np.sqrt(mean_squared_error(y, preds))
    r2 = r2_score(y, preds)

    print(f"✅ Model trained successfully!")
    print(f"   MAE: {mae:.2f} passengers")
    print(f"   RMSE: {rmse:.2f}")
    print(f"   R² Score: {r2:.4f}")

    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/occupancy_model.pkl')
    print("💾 Model saved to models/occupancy_model.pkl")

if __name__ == '__main__':
    train_and_save_model()

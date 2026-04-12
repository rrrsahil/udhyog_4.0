import os
import pandas as pd
import numpy as np
import joblib
import logging

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.multioutput import MultiOutputRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# ================= LOGGING =================
logging.basicConfig(level=logging.INFO)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "saved_property_models")

os.makedirs(MODEL_DIR, exist_ok=True)


# ================= LOAD DATASET =================
def load_dataset(file_path):

    logging.info(f"Loading dataset: {file_path}")

    if file_path.endswith(".csv"):
        df = pd.read_csv(file_path)

    elif file_path.endswith((".xlsx", ".xls")):
        df = pd.read_excel(file_path)

    else:
        raise ValueError("Unsupported file format")

    df = df.dropna()
    df.columns = df.columns.str.strip()

    logging.info(f"Dataset loaded with {len(df)} rows")

    return df


# ================= TRAIN PROPERTY MODEL =================
def train_property_model(file_path, input_columns, target_columns):

    df = load_dataset(file_path)

    # Ensure numeric
    df[input_columns] = df[input_columns].apply(
        pd.to_numeric, errors="coerce"
    ).fillna(0)

    df[target_columns] = df[target_columns].apply(
        pd.to_numeric, errors="coerce"
    ).fillna(0)

    X = df[input_columns]
    y = df[target_columns]

    # ================= SCALING =================
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Save scaler & columns
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))
    joblib.dump(input_columns, os.path.join(MODEL_DIR, "inputs.pkl"))
    joblib.dump(target_columns, os.path.join(MODEL_DIR, "targets.pkl"))

    # ================= TRAIN TEST SPLIT =================
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    # ================= MODEL =================
    model = MultiOutputRegressor(LinearRegression())
    model.fit(X_train, y_train)

    # Save model
    joblib.dump(model, os.path.join(MODEL_DIR, "property_model.pkl"))

    # ================= EVALUATION =================
    y_pred = model.predict(X_test)

    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    logging.info(f"Training completed | MSE: {mse}, R2: {r2}")

    return {
        "message": "Property model trained successfully",
        "mse": round(mse, 4),
        "r2_score": round(r2, 4),
        "inputs_used": input_columns,
        "targets_predicted": target_columns
    }


# ================= PREDICT PROPERTIES =================
def predict_properties(sample_dict):

    # Load saved artifacts
    scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
    model = joblib.load(os.path.join(MODEL_DIR, "property_model.pkl"))
    input_columns = joblib.load(os.path.join(MODEL_DIR, "inputs.pkl"))
    target_columns = joblib.load(os.path.join(MODEL_DIR, "targets.pkl"))

    # Convert input
    input_df = pd.DataFrame([sample_dict])

    # Ensure all required inputs exist
    for col in input_columns:
        if col not in input_df.columns:
            input_df[col] = 0

    input_df = input_df[input_columns]
    input_df = input_df.apply(pd.to_numeric, errors="coerce").fillna(0)

    # Scale
    input_scaled = scaler.transform(input_df)

    # Predict
    predictions = model.predict(input_scaled)[0]

    result = {}

    for i, target in enumerate(target_columns):
        value = float(predictions[i])

        result[target] = {
            "predicted_value": round(value, 4),
            "range_level": (
                "High" if value > np.mean(predictions)
                else "Low"
            )
        }

    return {
        "prediction_results": result
    }
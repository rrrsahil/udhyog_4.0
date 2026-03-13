from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict

# =========================
# IMPORT ML MODULES
# =========================

from model_utils import train_model, predict_single_sample
from diagnosis_utils import run_diagnosis
from mechanical_utils import run_mechanical_analysis


# =========================
# FASTAPI APP
# =========================

app = FastAPI(
    title="Quality Prognosis ML Service",
    description="Machine Learning Service for Training, Prediction, and Diagnosis",
    version="2.0"
)


# =========================
# REQUEST MODELS
# =========================

class TrainingRequest(BaseModel):
    file_path: str
    neurons: int
    hidden_layers: int
    activation: str
    epochs: int
    learning_rate: float
    algorithm: str
    batch_size: int
    training_id: str


class PredictionRequest(BaseModel):
    sample: Dict[str, float]


class DiagnosisRequest(BaseModel):
    file_path: str


# =========================
# ROOT ENDPOINT
# =========================

@app.get("/")
def root():
    return {
        "message": "Quality Prognosis ML Service Running"
    }


# =========================
# TRAIN MODEL
# =========================

@app.post("/train")
def train(req: TrainingRequest):
    """
    Train neural network model using selected algorithm
    """
    return train_model(req)


# =========================
# PREDICT DEFECT PROBABILITY
# =========================

@app.post("/predict")
def predict(req: PredictionRequest):
    """
    Predict defect probability using trained model
    """
    return predict_single_sample(req.sample)


# =========================
# DEFECT DIAGNOSIS MODULE
# =========================

@app.post("/diagnosis")
def diagnosis(req: DiagnosisRequest):
    """
    Diagnose critical parameters causing defects
    using Bayesian probability analysis
    """
    return run_diagnosis(req.file_path)


# =========================
# MECHANICAL PROPERTY ANALYSIS
# =========================

@app.post("/mechanical")
def mechanical_analysis(req: DiagnosisRequest):
    """
    Analyze critical parameters affecting
    mechanical properties such as:
    - Ultimate Tensile Strength (UTS)
    - Yield Strength (YS)
    - Elongation (ELOG)

    Uses Bayesian probability analysis
    similar to defect diagnosis.
    """
    return run_mechanical_analysis(req.file_path)
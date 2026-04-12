from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, List

# =========================
# IMPORT ML MODULES
# =========================

from model_utils import train_model, predict_single_sample
from diagnosis_utils import run_diagnosis
from mechanical_utils import run_mechanical_analysis
from property_prognosis_utils import train_property_model, predict_properties

# =========================
# FASTAPI APP
# =========================

app = FastAPI(
    title="Quality Prognosis ML Service",
    description="Machine Learning Service for Training, Prediction, and Diagnosis",
    version="3.0"
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
    sample: Dict[str, float] = None
    inputs: Dict[str, float] = None

class DiagnosisRequest(BaseModel):
    file_path: str
    input_columns: List[str] = []
    target_columns: List[str] = []

# =========================
# PROPERTY PROGNOSIS MODELS
# =========================

class PropertyTrainingRequest(BaseModel):
    file_path: str
    input_columns: List[str]
    target_columns: List[str]


class PropertyPredictionRequest(BaseModel):
    sample: Dict[str, float]

# =========================
# ROOT ENDPOINT
# =========================

@app.get("/")
def root():
    return {
        "message": "Quality Prognosis ML Service Running"
    }

# =========================
# TRAIN MODEL (DEFECT)
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
    data = req.sample or req.inputs

    if not data:
        return {"error": "No input data provided"}

    return predict_single_sample(data)

# =========================
# DEFECT DIAGNOSIS MODULE
# =========================

@app.post("/diagnosis")
def diagnosis(req: DiagnosisRequest):
    """
    Diagnose critical parameters causing defects
    using Bayesian probability analysis
    """
    return run_diagnosis(
        req.file_path,
        req.input_columns,
        req.target_columns
    )

# =========================
# MECHANICAL PROPERTY ANALYSIS (DIAGNOSIS)
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
    return run_mechanical_analysis(
        req.file_path,
        req.input_columns,
        req.target_columns
    )
    
# =========================
# PROPERTY PROGNOSIS (TRAIN)
# =========================

@app.post("/property/train")
def train_property(req: PropertyTrainingRequest):
    """
    Train regression model for predicting
    mechanical properties dynamically
    """
    return train_property_model(
        req.file_path,
        req.input_columns,
        req.target_columns
    )

# =========================
# PROPERTY PROGNOSIS (PREDICT)
# =========================

@app.post("/property/predict")
def predict_property(req: PropertyPredictionRequest):
    """
    Predict mechanical properties such as:
    UTS, YS, ELOG, Hardness, RA
    based on selected input parameters
    """
    return predict_properties(req.sample)
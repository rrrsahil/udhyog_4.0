import os
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
import shap
import requests
from pymongo import MongoClient

from tensorflow.keras.callbacks import Callback
from tensorflow.keras import regularizers

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score
)

from sklearn.neural_network import MLPClassifier

MODEL_DIR = "saved_models"
os.makedirs(MODEL_DIR, exist_ok=True)


# ================= PROGRESS CALLBACK =================
class ProgressCallback(Callback):
    def __init__(self, training_id):
        super().__init__()
        self.training_id = training_id

    def on_epoch_end(self, epoch, logs=None):
        progress = int(((epoch + 1) / self.params["epochs"]) * 100)
        try:
            requests.put(
                f"http://127.0.0.1:5000/api/training/progress/{self.training_id}",
                json={"progress": progress}
            )
        except:
            pass


# ================= LOAD DATA =================
def load_dataset(source):

    if source.startswith("mongodb://"):
        client = MongoClient(source)
        db = client.get_database()
        collection = db.get_collection("dataset")
        data = list(collection.find({}, {"_id": 0}))
        return pd.DataFrame(data)

    if source.endswith(".csv"):
        return pd.read_csv(source)

    elif source.endswith((".xlsx", ".xls")):
        return pd.read_excel(source)

    else:
        raise ValueError("Unsupported format")


# ================= TRAIN =================
def train_model(req):

    tf.keras.backend.clear_session()

    df = load_dataset(req.file_path)
    df = df.dropna()
    df.columns = df.columns.str.strip()

    heat_column = df.columns[0]
    target_columns = df.columns[1:6]
    input_columns = df.columns[6:]

    X = df[input_columns].apply(pd.to_numeric, errors="coerce").fillna(0)
    y = df[target_columns]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))
    joblib.dump(input_columns.tolist(), os.path.join(MODEL_DIR, "features.pkl"))
    joblib.dump(target_columns.tolist(), os.path.join(MODEL_DIR, "targets.pkl"))
    joblib.dump(req.algorithm, os.path.join(MODEL_DIR, "algo.pkl"))

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y.values, test_size=0.2, random_state=42
    )

    # ================= QUASI-NEWTON (L-BFGS) =================
    if req.algorithm == "Quasi-Newton (L-BFGS)":

        model = MLPClassifier(
            hidden_layer_sizes=(req.neurons,) * req.hidden_layers,
            solver='lbfgs',
            max_iter=req.epochs
        )

        model.fit(X_train, y_train)

        joblib.dump(model, os.path.join(MODEL_DIR, "lbfgs_model.pkl"))

        preds = model.predict(X_test)

        raw_preds = model.predict_proba(X_test)

        history = {"val_accuracy": [model.score(X_test, y_test)]}

        weights_bias = []

    else:

        # ================= TENSORFLOW MODEL =================
        model = tf.keras.Sequential()
        model.add(tf.keras.layers.Input(shape=(X_train.shape[1],)))

        activation_map = {
            "Sigmoid": "sigmoid",
            "ReLU": "relu",
            "Tanh": "tanh",
            "sigmoid": "sigmoid",
            "relu": "relu",
            "tanh": "tanh"
        }

        chosen_activation = activation_map.get(req.activation, "relu")

        for _ in range(req.hidden_layers):

            # Bayesian Regularization
            if req.algorithm == "Bayesian Regularization":
                model.add(tf.keras.layers.Dense(
                    req.neurons,
                    activation=chosen_activation,
                    kernel_regularizer=regularizers.l2(0.01)
                ))
            else:
                model.add(tf.keras.layers.Dense(
                    req.neurons,
                    activation=chosen_activation
                ))

        model.add(tf.keras.layers.Dense(len(target_columns), activation="sigmoid"))

        # OPTIMIZER SWITCH
        if req.algorithm == "Back Propagation":
            optimizer = tf.keras.optimizers.SGD(
                learning_rate=req.learning_rate
            )

        elif req.algorithm == "Momentum & Adaptive Learning":
            optimizer = tf.keras.optimizers.SGD(
                learning_rate=req.learning_rate,
                momentum=0.9
            )

        elif req.algorithm == "Adam":
            optimizer = tf.keras.optimizers.Adam(
                learning_rate=req.learning_rate
            )

        elif req.algorithm == "Bayesian Regularization":
            optimizer = tf.keras.optimizers.Adam(
                learning_rate=req.learning_rate
            )

        else:
            optimizer = tf.keras.optimizers.Adam(
                learning_rate=req.learning_rate
            )

        model.compile(
            optimizer=optimizer,
            loss="binary_crossentropy",
            metrics=["accuracy"]
        )

        history_obj = model.fit(
            X_train,
            y_train,
            epochs=req.epochs,
            batch_size=req.batch_size,
            validation_split=0.2,
            verbose=0,
            callbacks=[ProgressCallback(req.training_id)]
        )

        history = history_obj.history

        model.save(os.path.join(MODEL_DIR, "tf_model.h5"))

        raw_preds = model.predict(X_test)
        preds = (raw_preds > 0.5).astype(int)

        weights_bias = []
        for layer in model.layers:
            if len(layer.get_weights()) > 0:
                w, b = layer.get_weights()
                weights_bias.append({
                    "weights": w.tolist(),
                    "bias": b.tolist()
                })

    # ================= METRICS =================
    accuracies = []
    precisions = []
    recalls = []
    f1_scores = []
    defect_probability_list = []
    cm_dict = {}

    for i, target in enumerate(target_columns):
        y_true = y_test[:, i]
        y_pred = preds[:, i]

        accuracies.append(accuracy_score(y_true, y_pred))
        precisions.append(precision_score(y_true, y_pred, zero_division=0))
        recalls.append(recall_score(y_true, y_pred, zero_division=0))
        f1_scores.append(f1_score(y_true, y_pred, zero_division=0))

        defect_probability_list.append(np.mean(y_pred))
        cm_dict[target] = confusion_matrix(y_true, y_pred).tolist()

    overall_accuracy = round(np.mean(accuracies) * 100, 2)
    precision_avg = round(np.mean(precisions) * 100, 2)
    recall_avg = round(np.mean(recalls) * 100, 2)
    f1_avg = round(np.mean(f1_scores) * 100, 2)
    defect_probability = round(np.mean(defect_probability_list) * 100, 2)

    cross_val_accuracy = round(
        np.mean(history.get("val_accuracy", [0])) * 100,
        2
    )

    # ================= SHAP =================
    shap_summary = {}
    try:
        if req.algorithm != "Quasi-Newton (L-BFGS)":
            explainer = shap.Explainer(model, X_train)
            shap_values = explainer(X_test[:10])
            values = shap_values.values

            if len(values.shape) == 3:
                mean_vals = np.abs(values).mean(axis=(0,1))
            else:
                mean_vals = np.abs(values).mean(axis=0)

            shap_summary = {
                "mean_abs_shap": mean_vals.tolist()
            }
        else:
            shap_summary = {"info": "SHAP skipped for L-BFGS model"}

    except Exception as e:
        shap_summary = {"error": str(e)}

    return {
        "accuracy": overall_accuracy,
        "cross_val_accuracy": cross_val_accuracy,
        "precision": precision_avg,
        "recall": recall_avg,
        "f1_score": f1_avg,
        "confusion_matrix": cm_dict,
        "defect_probability": defect_probability,
        "targets": target_columns.tolist(),
        "weights_bias": weights_bias,
        "shap_summary": shap_summary,
        "algorithm": req.algorithm
    }


# ================= PREDICT =================
def predict_single_sample(sample_dict):

    scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
    features = joblib.load(os.path.join(MODEL_DIR, "features.pkl"))
    targets = joblib.load(os.path.join(MODEL_DIR, "targets.pkl"))
    algo = joblib.load(os.path.join(MODEL_DIR, "algo.pkl"))

    input_df = pd.DataFrame([sample_dict])
    input_df = input_df.apply(pd.to_numeric, errors="coerce").fillna(0)

    for f in features:
        if f not in input_df.columns:
            input_df[f] = 0

    input_df = input_df[features]
    input_scaled = scaler.transform(input_df)

    if algo == "Quasi-Newton (L-BFGS)":
        model = joblib.load(os.path.join(MODEL_DIR, "lbfgs_model.pkl"))
        raw_pred = model.predict_proba(input_scaled)
        probabilities = raw_pred[0]
    else:
        model = tf.keras.models.load_model(os.path.join(MODEL_DIR, "tf_model.h5"))
        raw_pred = model.predict(input_scaled)
        probabilities = raw_pred[0]

    result = {}

    for i, target in enumerate(targets):
        prob = float(probabilities[i])
        result[target] = {
            "probability_percent": round(prob * 100, 2),
            "prediction": int(prob > 0.5),
            "risk_level": (
                "High" if prob > 0.7
                else "Medium" if prob > 0.4
                else "Low"
            )
        }

    return {
        "prediction_results": result
    }

    # $env:TF_ENABLE_ONEDNN_OPTS=0
    # python -m uvicorn main:app --reload --port 8001
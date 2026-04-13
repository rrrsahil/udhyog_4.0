<div align="center">

# 🏭 Udhyog 4.0

### Industrial Quality Prognosis System

<p><i>Predictive Maintenance • Defect Diagnosis • Mechanical Property Estimation</i></p>

<br/>

<img src="https://img.shields.io/badge/version-3.0.0-blue.svg" />
<img src="https://img.shields.io/badge/status-active-success.svg" />
<img src="https://img.shields.io/badge/build-passing-brightgreen.svg" />
<img src="https://img.shields.io/badge/license-not%20specified-lightgrey.svg" />

<br/>

<img src="https://img.shields.io/badge/Python-3.9+-yellow.svg" />
<img src="https://img.shields.io/badge/Node.js-18.x-green.svg" />
<img src="https://img.shields.io/badge/React-19.2-blue.svg" />
<img src="https://img.shields.io/badge/TensorFlow-2.15-orange.svg" />

</div>

---

# 📖 Executive Summary

The **Industrial Quality Prognosis System (Udhyog 4.0)** is designed for Industry 4.0 environments. It integrates a React-based frontend, a Node.js orchestration backend, and a Python FastAPI ML engine.

The system predicts defects, diagnoses root causes, and estimates mechanical properties such as:

* Ultimate Tensile Strength (UTS)
* Yield Strength (YS)
* Elongation

It combines neural networks, Bayesian reasoning, and SHAP-based explainability.

---

# 🧩 What This System Does

✔ Predict defects before occurrence
✔ Diagnose root causes using probabilistic logic
✔ Estimate mechanical properties
✔ Provide explainability using SHAP values
✔ Handle end-to-end ML pipeline (upload → train → predict → visualize)

---

# 📐 Architecture Overview

```mermaid
graph TD
    subgraph Frontend [React (Vite)]
        UI[Dashboard UI]
        Axios[HTTP Layer]
    end

    subgraph Backend [Node.js / Express]
        Express[Middleware Layer]
        Auth[Auth Controller]
        Broker[ML Proxy Controller]
    end

    subgraph ML [Python FastAPI]
        API[FastAPI Server]
        TF[TensorFlow Models]
        SK[Scikit Models]
        Bayes[Bayesian Logic]
        SHAP[Explainability]
    end

    subgraph DB [Storage]
        Mongo[(MongoDB)]
        Files[(Model Files)]
        Cloud[Cloudinary]
    end

    UI <--> Axios
    Axios <--> Express
    Express --> Auth
    Auth <--> Mongo
    Express <--> Broker
    Broker <--> API
    API --> TF
    API --> Bayes
    API --> SK
    TF --> Files
    SK --> Files
```

---

# 🔄 Data Flow

```text
User → Frontend → Backend → ML Service → Backend → Frontend
```

1. User uploads dataset
2. Backend validates and stores data
3. Backend triggers ML service
4. ML service processes training/prediction
5. Results returned and visualized

---

# 🛠 Tech Stack

## ⚡ Frontend

* React (Vite)
* Axios
* Chart.js
* Lottie React

## 🔀 Backend

* Node.js
* Express.js
* JWT Authentication
* Bcryptjs
* Multer (file uploads)
* Cloudinary

## 🧠 ML Service

* FastAPI (Uvicorn)
* TensorFlow
* Scikit-learn
* SHAP

## 🗄 Storage

* MongoDB
* Local filesystem (.pkl / .h5)

---

# 📁 Project Structure

```
root/
├── Frontend/
├── Backend/
├── ML_Service/
├── uploads/
└── README.md
```

---

# ⚙️ Setup & Installation

## 1️⃣ Start ML Service

```bash
cd ML_Service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001
```

---

## 2️⃣ Start Backend

Create `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/prognosisDB
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_email
EMAIL_PASS=your_password
ML_SERVICE_URL=http://127.0.0.1:8001
```

```bash
cd Backend
npm install
npm run dev
```

---

## 3️⃣ Start Frontend

```bash
cd Frontend
npm install
npm run dev
```

---

# 🔐 Environment Variables

| Variable       | Description        |
| -------------- | ------------------ |
| PORT           | Backend port       |
| MONGO_URI      | MongoDB connection |
| JWT_SECRET     | Auth secret        |
| CLIENT_URL     | Frontend URL       |
| ML_SERVICE_URL | ML service         |
| EMAIL_USER     | SMTP email         |
| EMAIL_PASS     | SMTP password      |

---

# 📡 API Endpoints

## 🔑 Auth

| Endpoint           | Method |
| ------------------ | ------ |
| /api/auth/register | POST   |
| /api/auth/login    | POST   |

---

## 📂 Dataset & Training

| Endpoint            | Method |
| ------------------- | ------ |
| /api/dataset/upload | POST   |
| /api/training/start | POST   |

---

## 🤖 ML Service

| Endpoint        | Method | Description         |
| --------------- | ------ | ------------------- |
| /train          | POST   | Train model         |
| /diagnosis      | POST   | Defect diagnosis    |
| /mechanical     | POST   | Property prediction |
| /property/train | POST   | Regression          |

---

# ⚠️ Known Limitations

* ML service tightly coupled via HTTP
* Large payloads can block Node.js event loop
* Models loaded from disk repeatedly
* Long-running HTTP requests
* No horizontal scaling

---

# 🔍 Audit Highlights

* Global model usage → concurrency risk
* Disk I/O during inference → latency
* Large JSON parsing → event loop blocking
* Long synchronous HTTP → proxy timeout risk

---

# 🚀 Future Improvements

* Async processing (Redis + Celery)
* Load models into memory at startup
* Streaming uploads instead of JSON
* Horizontal scaling support
* Fault tolerance improvements

---

# 🧪 Testing

Not enough information about automated testing.

---

# 📸 Screenshots

> Add:

* Dashboard UI
* Training workflow
* Prediction results

---

# 📄 License

No license specified.

---

<div align="center">

### ⚙️ Built for Industrial ML Systems

### 📊 Focused on Performance • Interpretability • Scalability

</div>

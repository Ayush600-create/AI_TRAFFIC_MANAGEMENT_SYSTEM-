# 🚦 TrafficGuard AI

### AI-Powered Traffic Violation Detection & Analysis System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-00e5ff?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge\&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge\&logo=vite)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-FF3366?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

*A smart surveillance system for detecting and analyzing traffic violations using deep learning and rule-based verification.*

</div>

---

## 📌 Overview

**TrafficGuard AI** is a full-stack intelligent traffic monitoring system designed to detect, analyze, and report traffic violations from video footage.

The system combines:

* 🧠 **YOLOv8 deep learning models** for object detection
* 📏 **Rule-based verification engine** for identifying violations
* 📊 **Modern React dashboard** for visualization and control

It is inspired by real-world **smart city traffic monitoring systems** and aligns with research-based multi-stage architectures.

---

## ✨ Features

| Feature                    | Description                                      |
| -------------------------- | ------------------------------------------------ |
| 🎥 **Video Analysis**      | Upload and analyze traffic footage using YOLOv8  |
| 🚗 **Vehicle Detection**   | Detect cars, bikes, trucks in real-time          |
| 🚨 **Violation Detection** | Red-light jumping, no-helmet, lane violations    |
| 📏 **Rule-Based Logic**    | Second-stage verification for accurate detection |
| 📊 **Dashboard**           | Real-time stats, logs, and system insights       |
| 📁 **Case Records**        | Store and view violation details                 |
| 📄 **Reports**             | Generate summaries for analysis                  |
| ⚡ **Fast Processing**      | Optimized inference pipeline                     |

---

## 🧠 System Architecture

```
Input Video
     ↓
YOLOv8 Detection Model
     ↓
Rule-Based Verification Engine
     ↓
Violation Detection Output
     ↓
Frontend Dashboard + Reports
```

---

## 🛠 Tech Stack

### Frontend

* React 19
* Vite 8
* React Router DOM
* Custom CSS (Glassmorphism UI)

### Backend

* Python (Flask / FastAPI)
* YOLOv8 (Ultralytics)
* OpenCV
* MongoDB

---

## 📁 Project Structure

```
traffic-ai/
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── App.jsx
├── backend/
│   ├── models/
│   ├── routes/
│   ├── detection.py
│   └── app.py
├── yolov8n.pt
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js ≥ 18
* Python ≥ 3.9
* MongoDB

---

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/trafficguard-ai.git

# Go to project
cd trafficguard-ai

# Install frontend
cd frontend
npm install
npm run dev

# Run backend
cd ../backend
pip install -r requirements.txt
python app.py
```

---

## 🎯 How It Works

1. Upload traffic video
2. YOLO detects vehicles and objects
3. Rule engine checks violations
4. Violations are logged and displayed
5. Reports are generated

---

## 🔌 API Endpoints

| Endpoint              | Description            |
| --------------------- | ---------------------- |
| `POST /upload`        | Upload video           |
| `GET /violations`     | Get all violations     |
| `GET /violations/:id` | Get specific violation |
| `GET /stats`          | Dashboard data         |

---

## 📸 Screenshots

*Add your project screenshots here (important for GitHub + resume)*

---

## 🚀 Future Enhancements

* 🔥 LLM-based violation explanation
* 🎯 Number plate recognition
* 📡 Live CCTV integration
* ☁️ Cloud deployment (AWS/GCP)
* 📱 Mobile app support

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Devanshu Sharma**

* B.E. CSE (AI & ML)
* Chandigarh University

---

## 🌟 Project Highlights (For Recruiters)

* Built a **real-time AI-based detection system**
* Implemented **multi-stage architecture (DL + rule-based)**
* Designed **full-stack dashboard with analytics**
* Worked with **computer vision + backend integration**

---

<div align="center">

⭐ *If you like this project, give it a star!*

</div>

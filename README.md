# 🌍 Disaster Response System

### 🚨 AI-Powered Real-Time Disaster Intelligence & Coordination Platform

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-GitHub%20Pages-blue?style=for-the-badge)](https://abhay-maddy.github.io/Disaster-Response-System/)

> **🔗 Open the live website:** [https://abhay-maddy.github.io/Disaster-Response-System/](https://abhay-maddy.github.io/Disaster-Response-System/)

---

## 📖 Overview

The **Disaster Response System** is a smart, AI-driven platform designed to **improve disaster management efficiency** by providing:

* ⚡ Real-time situational awareness
* 🤖 AI-based assistance & insights
* 📊 Interactive dashboards for decision-making
* 🌐 Seamless coordination between citizens & responders

This system bridges the gap between **data, people, and emergency services** to enable **faster and smarter disaster response**.

---

## 🚩 Problem Statement

During natural or man-made disasters:

* ❌ Information is scattered and delayed
* ❌ Victims cannot quickly access help
* ❌ Authorities lack real-time insights
* ❌ Rescue operations suffer from poor coordination

👉 These challenges lead to **loss of lives, delayed response, and inefficient resource usage**.

---

## 💡 Our Solution

The Disaster Response System provides a **centralized intelligent platform** that:

* 📡 Collects and processes real-time data
* 🧠 Uses AI to analyze and assist decision-making
* 🤖 Provides chatbot-based emergency guidance
* 📊 Visualizes data for authorities and responders

---

## 🧠 System Architecture (High-Level)

```
User / Victim
     ↓
Frontend (HTML / Streamlit UI)
     ↓
Backend API (Node.js / Express)
     ↓
AI Engine (Python NLP + OpenAI)
     ↓
Response / Insights / Alerts
```

---

## 🚀 Core Features

### 1️⃣ 🤖 AI Chatbot Assistant

* Provides instant disaster guidance
* Answers queries like:

  * "What to do during an earthquake?"
  * "Nearest safe zone?"
* Built using NLP + AI APIs

---

### 2️⃣ 📊 Interactive Dashboard

* Built with **Streamlit**
* Displays:

  * Disaster updates
  * Insights & alerts
* Helps authorities make quick decisions

---

### 3️⃣ 📡 Real-Time Data Handling

* Continuously processes incoming data
* Keeps system updated with latest conditions

---

### 4️⃣ 🌍 Safe Zone Awareness

* Displays safe areas / zones
* Helps users navigate to safer locations

---

### 5️⃣ 🔗 Full Stack Integration

* Frontend + Backend + AI connected seamlessly
* Smooth communication between all modules

---

## 🏗️ Tech Stack (Detailed Explanation)

### 🎨 Frontend

* **HTML, CSS, JavaScript**

  * Used to build static pages like safe zones & team info
  * Ensures simple and accessible UI

* **Streamlit**

  * Used for building interactive dashboards
  * Enables quick visualization without heavy frontend frameworks
  * Ideal for hackathons & data-driven apps

---

### ⚙️ Backend

* **Node.js**

  * Handles server-side logic
  * Enables fast and scalable backend processing

* **Express.js**

  * Lightweight framework for building APIs
  * Manages routes like user handling and requests

---

### 🧠 AI / Machine Learning Layer

* **Python**

  * Used for AI processing and chatbot logic

* **NLP (Natural Language Processing)**

  * Understands user queries
  * Generates meaningful responses

* **OpenAI API**

  * Powers intelligent chatbot responses
  * Provides contextual disaster assistance

---

### 📦 Package & Dependency Management

* **npm**

  * Manages backend dependencies

* **pip (requirements.txt)**

  * Manages Python-based AI dependencies

---

## 📂 Project Structure

```
📁 Disaster-Response-System
│
├── 📁 .github
│   └── 📁 workflows
│       └── deploy.yml          ← GitHub Actions: auto-build & deploy
│
├── 📁 frontend                 ← Vite multi-page app (deployed to GitHub Pages)
│   ├── index.html              ← Main citizen dashboard
│   ├── login.html              ← Login page
│   ├── register.html           ← Citizen registration
│   ├── admin.html              ← Responder / admin panel
│   ├── admin-register.html     ← Responder registration
│   ├── 📁 css/                 ← Stylesheets
│   ├── 📁 js/                  ← JavaScript modules
│   ├── 📁 public/              ← Static assets (favicon, icons)
│   ├── vite.config.js          ← Vite config (base = /Disaster-Response-System/)
│   └── package.json
│
├── 📁 backend                  ← Node.js / Express API (not deployed to Pages)
├── 📁 ml_model                 ← Python AI / ML scripts
├── 📁 web_demo                 ← Additional demo files
└── 📄 README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ArShx17/Disaster-Response-System.git
cd Disaster-Response-System
```

---

### 2️⃣ Install Dependencies

#### Backend

```bash
npm install
```

#### AI / Python

```bash
pip install -r requirements.txt
```

---

### 3️⃣ Configure Environment Variables

Create a `.env` file and add:

```
OPENAI_API_KEY=your_api_key_here
```

---

### 4️⃣ Run the Application

```bash
npm start
```

---

### 5️⃣ Access the App

```
http://localhost:8000
```

---

## 🧪 How the System Works

1. 📥 User sends request/query
2. ⚙️ Backend processes request
3. 🧠 AI module analyzes input
4. 📊 Results displayed on UI
5. 🚨 User gets real-time assistance

---

## 🎯 Use Cases

* 🏛️ Government disaster management agencies
* 🚑 Emergency response teams
* 🌍 NGOs and volunteers
* 👨‍👩‍👧 Citizens in affected areas

---

## 🔥 Unique Selling Points (USP)

* ⚡ Combines **AI + Real-Time Data**
* 🤖 Intelligent chatbot for disaster help
* 📊 Dashboard for decision-makers
* 🌐 Scalable for large-scale deployment

---

## 🔮 Future Enhancements

* 📍 Live GPS tracking of users & responders
* 📲 Mobile application (Android/iOS)
* 🔔 SMS & push notification alerts
* 🛰️ Integration with IoT & satellite data
* 🧭 Automatic nearest helper detection

---

## 🚀 GitHub Pages Deployment

The frontend is automatically deployed to GitHub Pages on every push to `main`.

**Live URL:** [https://abhay-maddy.github.io/Disaster-Response-System/](https://abhay-maddy.github.io/Disaster-Response-System/)

### How it works

1. GitHub Actions (`.github/workflows/deploy.yml`) runs `npm ci && npm run build` inside the `frontend/` directory.
2. The built `frontend/dist/` folder is pushed to the `gh-pages` branch.
3. GitHub Pages serves from `gh-pages`.

### Enable Pages (first-time setup)

1. Go to your repository → **Settings → Pages**.
2. Set **Source** to `Deploy from a branch`.
3. Select the **`gh-pages`** branch → `/ (root)` → Save.

After the next push to `main` the site will be live at the URL above.

---



```bash
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Open Pull Request
```

---

## ⭐ Support

If you find this project useful, give it a ⭐ on GitHub!

---

# 🚨 AI Disaster Response System

A full-stack emergency coordination platform with real-time SOS, AI threat prediction, incident reporting, and admin command centre.

**Live:** https://abhay-maddy.github.io/Disaster-Response-System/

---

## ✅ Features

| Feature | Status |
|---------|--------|
| Citizen Register / Login | ✅ Working |
| Email OTP Verification | ✅ Real email (EmailJS) |
| One-Tap SOS Emergency | ✅ Working |
| GPS Location Detection | ✅ Working |
| Incident Report + Photo | ✅ Working |
| Live Disaster Map (Leaflet) | ✅ Working |
| Community Incident Feed | ✅ Working |
| AI Threat Prediction Simulator | ✅ Working |
| Admin Command Centre | ✅ Working |
| Dispatch / Resolve Emergencies | ✅ Working |
| Dark / Light Theme Toggle | ✅ Working |

---

## 🏗️ Project Structure

```
/ (repo root — served by GitHub Pages)
├── index.html           Landing page
├── login.html           Citizen login
├── register.html        Citizen registration + OTP
├── dashboard.html       User command centre
├── admin.html           Admin / responder panel
├── admin-register.html  Admin account creation
├── css/                 Stylesheets
│   ├── styles.css       Dashboard & auth styles
│   ├── landing.css      Landing page styles
│   └── ...
├── js/                  JavaScript
│   ├── script.js        Core logic (auth, SOS, OTP, admin)
│   ├── dashboard-inline.js  Map, community feed, GPS
│   └── theme-init.js    Dark/light mode (loads before CSS)
├── favicon.svg
│
├── frontend/            ← SOURCE OF TRUTH (edit these files)
│   └── (mirrors root structure)
│
├── backend/             Express + MongoDB API (optional)
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   └── models/
│
└── ml_model/            Python ML priority predictor
```

> **Rule:** Always edit files inside `frontend/`. The CI workflow automatically syncs them to root on every push.

---

## 🔑 Admin Access

| Field | Value |
|-------|-------|
| Admin ID | `admin` |
| Password | `admin123` |

Or create a custom admin via the **Responder Register** page with clearance code `1234`.

---

## 📧 Email OTP Setup (EmailJS — Free, No Backend Needed)

The OTP system is ready to send real emails. You just need to connect your EmailJS account:

### Step 1 — Create a Free EmailJS Account
Go to **https://emailjs.com** → Sign up free (200 emails/month)

### Step 2 — Add an Email Service
1. Dashboard → **Email Services** → **Add New Service**
2. Choose **Gmail** (or Outlook, Yahoo)
3. Authorize and save. Copy the **Service ID** (e.g. `service_abc123`)

### Step 3 — Create an Email Template
1. Dashboard → **Email Templates** → **Create New Template**
2. Set Subject: `Your Verification Code — AI Disaster Response`
3. Set Body:
   ```
   Hi {{to_name}},

   Your verification code is: {{otp_code}}

   This code expires in 10 minutes.
   Do not share it with anyone.

   — AI Disaster Response System
   ```
4. Save. Copy the **Template ID** (e.g. `template_otp`)

### Step 4 — Get Your Public Key
Dashboard → **Account** → **General** → Copy **Public Key** (e.g. `user_XYZ...`)

### Step 5 — Add to the Code
Open `frontend/js/script.js` (lines 7–9) and fill in:

```js
const EMAILJS_PUBLIC_KEY  = 'user_XYZ...';       // ← your public key
const EMAILJS_SERVICE_ID  = 'service_abc123';     // ← your service ID
const EMAILJS_TEMPLATE_ID = 'template_otp';       // ← your template ID
```

Then commit and push — the CI will deploy automatically.

> **Without EmailJS configured:** The system runs in Demo Mode — the OTP appears as a toast notification on screen (still fully functional for testing).

---

## 🚀 Deployment Guide

### Frontend — GitHub Pages (already live)

The project deploys automatically via GitHub Actions on every push to `main`.

```
Push to main → CI syncs frontend/ → root → GitHub Pages serves it
```

No manual build step needed.

### Backend — Render (Optional)

The Express backend exists but the frontend currently uses `localStorage` as its data store (works perfectly for a demo). To deploy the backend:

1. Create a free account at **https://render.com**
2. New → **Web Service** → connect your GitHub repo
3. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add **Environment Variables:**
   ```
   PORT          = 10000
   MONGO_URI     = mongodb+srv://user:pass@cluster.mongodb.net/disaster_response
   JWT_SECRET    = your_random_secret_here_min_32_chars
   ```
5. Click **Deploy**. Copy the URL (e.g. `https://disaster-api.onrender.com`)

---

## 🛠️ Local Development

```bash
# Backend
cd backend
npm install
npm run dev        # runs on http://localhost:5000

# Frontend (any static server)
cd frontend
npx serve .        # or open index.html directly in browser
```

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML5, CSS3, JavaScript |
| Mapping | Leaflet.js (OpenStreetMap) |
| OTP | EmailJS (browser SDK, no backend) |
| Auth | localStorage (client-side, demo-ready) |
| Backend | Node.js + Express (optional) |
| Database | MongoDB + Mongoose (optional) |
| AI/ML | Python + FastAPI (priority predictor) |
| Hosting | GitHub Pages (frontend) + Render (backend) |

---

## 👥 Contributors

See live contributors on the landing page footer.

---

## 📄 License

MIT — free to use, modify, and deploy.

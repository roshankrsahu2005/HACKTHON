# Hear2Heal - AI Medical Translation & Clinical Triage Platform

<div align="center">
  <br />
  <strong>Offline-First, Zero-Click Medical Language Auto-Detection, Clinical Translation & Emergency Triage Engine</strong>
  <br /><br />
</div>

---

## 🌟 Overview

**Hear2Heal** is an emergency-grade clinical communication and triage platform designed for emergency rooms, clinics, disaster response, and rural healthcare environments. It eliminates language barriers between patients and healthcare providers through **real-time speech recognition**, **multilingual NLP/AI translation**, **color-coded clinical triage grading**, and **interactive 3D anatomical pain mapping**.

---

## ✨ Key Features & Clinical Modules

### 1. 🎙️ Real-Time Patient Translation (`PatientTranslationScreen.tsx`)
- **Zero-Click Speech Recognition**: Live audio capture with real-time waveform visualization.
- **Auto-Detection Engine**: Automatically identifies 12+ Indian and Global regional languages (Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi, Urdu, Spanish, Arabic, French, English).
- **Emergency Triage Scoring**: Real-time triage classification (**Red** / **Yellow** / **Green**) with automatic detection of critical cardiopulmonary, neurological, or trauma symptoms.
- **Audio Playback**: Instant speech synthesis in both patient and doctor languages.

### 2. 👨‍⚕️ Doctor Clinical Response (`DoctorReplyScreen.tsx`)
- **Doctor Speech-to-Text**: Live speech recognition in the doctor's preferred language.
- **1-Click Clinical Inquiry Templates**: Rapid questioning presets with verified multi-language translations:
  - *Medicine Intake ("Have you taken any medicine today?")*
  - *Pain Localization ("Where exactly does it hurt the most?")*
  - *Duration & Onset ("Since how many hours or days have you had this pain?")*
  - *Oxygen Protocol ("Please take deep breaths. We are starting oxygen support now.")*
  - *Comorbidity Check ("Do you have diabetes, high blood pressure or heart problems?")*
  - *Patient Reassurance ("Stay calm. You are in safe hands, help is right here.")*
- **Live Multilingual Voice Broadcast**: Instant audio playback to the patient in their native dialect.

### 3. 🧍 3D Anatomical Muscular Body Map (`BodyMapScreen.tsx`)
- **High-Resolution 3D Muscular Anatomy**: Detailed front (**Anterior**) and back (**Posterior**) muscular system views.
- **Interactive Anatomical Pain Pins**: Sleek, high-precision touchpoints (Head, Neck, Pectorals, Abdomen, Lumbar, Spine, Shoulders, Arms, Thighs, Knees, Calves).
- **Pain Severity Grading**: Instant triage classification (Mild 1–3, Moderate 4–6, Severe/Critical 7–10).

### 4. 🚨 Emergency SOS Broadcast (`EmergencyScreen.tsx`)
- **6 Quick-Action Emergency Tiles**: One-tap trigger for *Can't Breathe*, *Severe Chest Pain*, *Severe Bleeding*, *Unconscious*, *Severe Allergy*, and *Pregnancy Complications*.
- **High-Priority Broadcast**: Instant dual-language broadcast announcement with loud alert audio for clinical staff.

### 5. 💊 Bilingual Prescription & Dosage (`MedicineScreen.tsx`)
- **Dosage Format Selector**: Tablet, Syrup, Injection, and Inhaler formats.
- **Translated Instructions & Schedules**: Dual-language dosage frequency (e.g., Morning/Evening after meals) with audio readout.

### 6. 📜 Consultation Dialogue History (`HistoryScreen.tsx`)
- **Live Dialogue Logging**: Complete transcript log of patient and doctor exchanges with timestamps and audio replay.
- **Zero-Data Loss**: Reset and clear controls with local persistence.

### 7. 🎨 Neumorphic Design System & Theme Customization (`SettingsScreen.tsx`)
- **4 Custom Themes**: Soft Neumorphic Light (`light`), Sleek Slate (`slate`), Medical Cyan (`cyan`), and Surgical Emerald (`emerald`).
- **Data-Theme Persistence**: Seamless local storage persistence across all 10 application views.

---

## 🏗️ Project Architecture

```
hear2heal/
├── frontend/                     # React 19 + Vite 8 Client
│   ├── src/
│   │   ├── assets/               # 3D Muscular anatomical assets
│   │   ├── components/
│   │   │   ├── icons/            # Medical vector icons
│   │   │   ├── layout/           # Header, navigation, status bars
│   │   │   └── screens/          # 10 clinical application screens
│   │   ├── data/                 # Multilingual presets & mock data
│   │   ├── utils/                # Audio, AI NLP engine, Supabase client
│   │   ├── types.ts              # TypeScript interface definitions
│   │   ├── App.tsx               # Root state & screen router
│   │   └── index.css             # Neumorphic design tokens & themes
│   ├── vite.config.ts            # Vite bundler configuration
│   └── package.json              # Frontend dependencies
│
├── backend/                      # Node.js + Express TypeScript API
│   ├── src/
│   │   ├── routes/               # API endpoints (/api/translate, /api/health)
│   │   ├── services/             # Gemini 2.5 Flash & Supabase service
│   │   └── server.ts             # Express server setup & CORS
│   ├── tsconfig.json             # Backend TypeScript config
│   └── package.json              # Backend dependencies
│
└── package.json                  # Root scripts & monorepo commands
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later

---

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-repo/hear2heal.git
cd hear2heal

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

---

### 2. Configure Environment Variables

#### Frontend (`frontend/.env`):
```env
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

#### Backend (`backend/.env`):
```env
PORT=5000
GEMINI_API_KEY=your-gemini-api-key
SUPABASE_URL=https://your-supabase-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

---

### 3. Run Development Servers

#### Option A: Run Both via Root Commands
```bash
# In terminal 1 (Backend API on http://localhost:5000):
npm run dev:backend

# In terminal 2 (Frontend on http://localhost:3000):
npm run dev:frontend
```

#### Option B: Run Directly from Respective Directories
```bash
# Start Backend:
cd backend
npm run dev

# Start Frontend:
cd frontend
npm run dev
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `POST` | `/api/translate` | Live clinical translation & emergency triage analysis |
| `POST` | `/api/sync/profile` | Sync patient profile to Supabase database |

#### Example `/api/translate` Request Payload:
```json
{
  "text": "मुझे सीने में बहुत तेज दर्द हो रहा है",
  "sourceLang": "Hindi",
  "targetLang": "en"
}
```

#### Example Response:
```json
{
  "detectedLanguage": "Hindi",
  "englishTranslation": "I am having severe chest pain.",
  "hindiTranslation": "मुझे सीने में बहुत तेज दर्द हो रहा है",
  "triageLevel": "red",
  "criticalSymptoms": ["Severe Chest Pain", "Cardiac Ischemia Alert"],
  "clinicalSummary": "Critical triage alert: Immediate cardiopulmonary evaluation required.",
  "recommendedAction": "Immediate Emergency Triage Required",
  "requiresImmediateSOS": true
}
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, TypeScript, Tailwind CSS v4, Lucide Icons, Web Speech API.
- **Backend**: Express.js, Node.js, TypeScript (`tsx`), Google Gen AI (`@google/genai` Gemini 2.5 Flash), Supabase JS.
- **Design Language**: Soft Neumorphism (`neu-card`, `neu-button`, `neu-pressed`, `neu-pill`, dynamic data-themes).

---

## 📄 License
This project is licensed under the MIT License.

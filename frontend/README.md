# Hear2Heal Frontend

The modern, emergency-ready client application for **Hear2Heal** — an AI-powered multilingual clinical translation and triage platform.

---

## 🚀 Key Modules & Screen Breakdown

| Screen Name | File Path | Core Functionality |
|---|---|---|
| **Login Screen** | [`src/components/screens/LoginScreen.tsx`](src/components/screens/LoginScreen.tsx) | Secure authentication with role-based clinical sign-in. |
| **Overview Screen** | [`src/components/screens/OverviewScreen.tsx`](src/components/screens/OverviewScreen.tsx) | Live dashboard with emergency triage stats & quick clinical actions. |
| **Patient Translation** | [`src/components/screens/PatientTranslationScreen.tsx`](src/components/screens/PatientTranslationScreen.tsx) | Real-time speech recognition, 12+ language auto-detect, and live AI translation. |
| **Doctor Reply** | [`src/components/screens/DoctorReplyScreen.tsx`](src/components/screens/DoctorReplyScreen.tsx) | Doctor voice transcription, 1-click clinical inquiries, and translated patient voice playback. |
| **Symptom Triage** | [`src/components/screens/QuickSymptomScreen.tsx`](src/components/screens/QuickSymptomScreen.tsx) | Instant triage category selection (Cardiopulmonary, Trauma, Neuro, GI, Allergy). |
| **Body Map** | [`src/components/screens/BodyMapScreen.tsx`](src/components/screens/BodyMapScreen.tsx) | 3D Muscular Anatomy locator with Anterior/Posterior views & pain severity grading. |
| **Emergency SOS** | [`src/components/screens/EmergencyScreen.tsx`](src/components/screens/EmergencyScreen.tsx) | 6 critical condition triggers & high-priority emergency audio broadcast. |
| **Medicine & Dosage** | [`src/components/screens/MedicineScreen.tsx`](src/components/screens/MedicineScreen.tsx) | Bilingual prescription generator with dosage schedule readouts. |
| **History Log** | [`src/components/screens/HistoryScreen.tsx`](src/components/screens/HistoryScreen.tsx) | Complete consultation dialogue history with timestamped audio replays. |
| **Settings & Themes** | [`src/components/screens/SettingsScreen.tsx`](src/components/screens/SettingsScreen.tsx) | 4 dynamic Neumorphic color schemes (`light`, `slate`, `cyan`, `emerald`). |

---

## 🎨 UI/UX Design System

Hear2Heal uses a unified **Soft Neumorphic** design system with dynamic theme tokens defined in [`src/index.css`](src/index.css):
- `neu-card`: Soft elevated container with dual-directional light/dark drop shadows.
- `neu-button`: Tactile interactive button with active depression effects.
- `neu-pressed`: Inset well for transcripts, active selections, and input fields.
- `neu-pill`: Elevated badge for metadata and statuses.
- `neu-button-primary`: Vibrant high-contrast gradient call-to-action.
- `neu-button-emergency`: Urgent pulsating red alert button.

---

## 🛠️ Tech Stack

- **Framework**: React 19 (`react`, `react-dom`)
- **Bundler**: Vite 8 with `@vitejs/plugin-react`
- **Language**: TypeScript (strict type safety)
- **Styling**: Tailwind CSS v4 & Custom Dataset Themes (`data-theme`)
- **Audio & Speech**: Web Speech API (`SpeechRecognition`, `speechSynthesis`)
- **Icons**: `lucide-react`
- **Database Client**: `@supabase/supabase-js`

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the `frontend/` directory:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 3. Run Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```
Build output will be bundled in the `dist/` directory.

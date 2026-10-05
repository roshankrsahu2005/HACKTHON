# Hear2Heal Frontend

Hear2Heal is an Offline Medical Language Auto-Detection & Clinical Translation Engine designed for Emergency Hospital & Triage environments.

## Tech Stack
- **Framework**: React 19 with Vite 8
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 & Custom CSS
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **Database / Sync**: Supabase JS Client

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` or set environment variables:
```env
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 3. Run Development Server
```bash
npm run dev
```
The frontend will start at `http://localhost:3000`.

### 4. Build Production Bundle
```bash
npm run build
```

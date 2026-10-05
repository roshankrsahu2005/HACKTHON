# Hear2Heal - Medical Translation & Clinical Triage Platform

Hear2Heal is an AI-powered Offline & Real-Time Medical Language Auto-Detection, Clinical Translation, and Emergency Triage System.

## Project Structure

```
.
├── frontend/             # React + Vite UI application
│   ├── src/              # Components, screens, data, and utilities
│   ├── index.html        # Main HTML entry point
│   ├── vite.config.ts    # Vite bundler configuration
│   ├── tsconfig.json     # TypeScript configuration
│   └── package.json      # Frontend dependencies
│
├── backend/              # Express + TypeScript Node server
│   ├── src/
│   │   ├── routes/       # API router endpoints (/api/translate, /api/health)
│   │   ├── services/     # Gemini AI & Supabase integration services
│   │   └── server.ts     # Express application server
│   ├── tsconfig.json     # Backend TypeScript configuration
│   └── package.json      # Backend dependencies
│
├── package.json          # Monorepo root scripts & workspace configuration
└── README.md             # Project documentation
```

## How to Run

### Frontend Application
```bash
# From workspace root
npm run dev:frontend

# Or directly from frontend directory
cd frontend
npm install
npm run dev
```

### Backend Application
```bash
# From workspace root
npm run dev:backend

# Or directly from backend directory
cd backend
npm install
npm run dev
```

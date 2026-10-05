# Hear2Heal Backend

Backend API server for Hear2Heal - AI Medical Language Auto-Detection & Clinical Translation Engine.

## Tech Stack
- **Framework**: Express.js
- **Runtime**: Node.js & TypeScript (`tsx`)
- **AI Integration**: `@google/genai` (Gemini API)
- **Database**: `@supabase/supabase-js` (Supabase Client)

## API Endpoints

- `GET /api/health`: Check server status
- `POST /api/translate`: Process patient translation & emergency triage grading
- `POST /api/sync/profile`: Save patient profile to database

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-supabase-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'Hear2Heal Medical Translation & Triage Backend API Server',
    status: 'Running',
    endpoints: {
      health: '/api/health',
      translate: 'POST /api/translate',
      syncProfile: 'POST /api/sync/profile'
    }
  });
});

app.listen(PORT, () => {
  console.log(`[Hear2Heal Backend] Server running on http://localhost:${PORT}`);
});

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for Disaster Offline Mode
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[Hear2Heal] Offline Disaster PWA Ready:', reg.scope);
      })
      .catch((err) => {
        console.warn('[Hear2Heal] SW notice:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);


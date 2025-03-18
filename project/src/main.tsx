import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Polyfill for process.env to fix pg library issues in browser
if (isBrowser) {
  window.process = {
    env: {
      NODE_ENV: import.meta.env.MODE,
      ...import.meta.env
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
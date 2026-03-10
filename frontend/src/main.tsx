/**
 * ============================================================================
 * APPLICATION ENTRY POINT
 * ============================================================================
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Initialize Sentry for error tracking
import { initSentry } from './lib/sentry';
initSentry();

// API Error Boundary for graceful error handling
import { ApiErrorBoundary } from './components/ApiErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApiErrorBoundary>
      <App />
    </ApiErrorBoundary>
  </StrictMode>,
);

// Build timestamp: 2026-03-10 13:04:00

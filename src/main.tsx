import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initCrashAnalytics } from './services/crashAnalytics';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Initialize global crash error handlers immediately
initCrashAnalytics();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);


import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { db, analytics } from '../config/firebase';

export interface CrashReport {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  type: 'runtime_error' | 'unhandled_rejection' | 'react_error_boundary' | 'manual_report';
  url: string;
  userAgent: string;
  componentStack?: string;
  fatal: boolean;
  metadata?: Record<string, any>;
}

const CRASH_STORAGE_KEY = 'mbd_crash_reports_v1';
const MAX_LOCAL_REPORTS = 50;

let memoryCrashReports: CrashReport[] = [];

/**
 * Retrieve all locally recorded crash reports (sorted newest first)
 */
export function getStoredCrashReports(): CrashReport[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(CRASH_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return memoryCrashReports;
}

/**
 * Store crash report locally for immediate inspection
 */
function saveLocalCrashReport(report: CrashReport) {
  try {
    const existing = getStoredCrashReports();
    const updated = [report, ...existing.slice(0, MAX_LOCAL_REPORTS - 1)];
    memoryCrashReports = updated;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CRASH_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('Unable to persist crash report to localStorage:', err);
  }
}

/**
 * Clear all locally stored crash reports
 */
export function clearStoredCrashReports(): void {
  memoryCrashReports = [];
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CRASH_STORAGE_KEY);
    }
  } catch (_) {}
}

/**
 * Record a crash or error event. Sends to Firestore, Firebase Analytics, and persists locally.
 */
export async function logCrash(params: {
  message: string;
  stack?: string;
  type?: CrashReport['type'];
  componentStack?: string;
  fatal?: boolean;
  metadata?: Record<string, any>;
}): Promise<CrashReport> {
  const report: CrashReport = {
    id: `crash_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    message: params.message || 'Unknown error occurred',
    stack: params.stack,
    type: params.type || 'runtime_error',
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    componentStack: params.componentStack,
    fatal: params.fatal ?? true,
    metadata: params.metadata
  };

  // 1. Output clean diagnostic log to console
  console.error('[mybudgetdeal99 Crash Analytics]:', report.message, {
    type: report.type,
    url: report.url,
    stack: report.stack,
    componentStack: report.componentStack
  });

  // 2. Persist locally for instant administrative access
  saveLocalCrashReport(report);

  // 3. Log to Firebase Analytics if initialized
  try {
    if (analytics) {
      logEvent(analytics, 'app_exception', {
        description: report.message.substring(0, 100),
        fatal: report.fatal,
        crash_id: report.id
      });
    }
  } catch (_) {}

  // 4. Send to Firestore 'crashes' collection (fire-and-forget, with fallback timeout)
  try {
    const crashesCol = collection(db, 'crashes');
    await Promise.race([
      addDoc(crashesCol, {
        ...report,
        createdAt: serverTimestamp()
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Crash report send timeout')), 2500))
    ]);
  } catch (err) {
    // If offline or blocked by ad-blocker, local storage copy still preserves diagnostic
    console.debug('Cloud crash sync pending or offline fallback used.');
  }

  return report;
}

/**
 * Initialize global browser window exception handlers
 */
let initialized = false;
export function initCrashAnalytics(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  // Unhandled synchronous runtime errors
  window.addEventListener('error', (event: ErrorEvent) => {
    // Ignore cross-origin script error noise with no message
    if (!event.message || event.message === 'Script error.') return;

    logCrash({
      message: event.message,
      stack: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
      type: 'runtime_error',
      fatal: true,
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });

  // Unhandled asynchronous Promise rejections
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    let message = 'Unhandled Promise Rejection';
    let stack: string | undefined;

    if (event.reason) {
      if (typeof event.reason === 'string') {
        message = event.reason;
      } else if (event.reason instanceof Error) {
        message = event.reason.message;
        stack = event.reason.stack;
      } else {
        try {
          message = JSON.stringify(event.reason);
        } catch {
          message = String(event.reason);
        }
      }
    }

    logCrash({
      message,
      stack,
      type: 'unhandled_rejection',
      fatal: false
    });
  });
}

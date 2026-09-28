import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuditLog } from '../types';

const LS_AUDIT_LOGS = 'mbd_audit_logs_v1';

export async function logAdminAction(
  adminEmail: string,
  action: string,
  entityType: AuditLog['entityType'],
  entityId: string,
  entityName: string,
  details?: string
): Promise<void> {
  const logEntry: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    adminEmail,
    action,
    entityType,
    entityId,
    entityName,
    timestamp: new Date().toISOString(),
    details
  };

  try {
    const colRef = collection(db, 'auditLogs');
    await addDoc(colRef, logEntry);
  } catch (e) {}

  try {
    const raw = localStorage.getItem(LS_AUDIT_LOGS);
    const existing: AuditLog[] = raw ? JSON.parse(raw) : [];
    existing.unshift(logEntry);
    if (existing.length > 200) existing.length = 200;
    localStorage.setItem(LS_AUDIT_LOGS, JSON.stringify(existing));
  } catch (e) {}
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  let logs: AuditLog[] = [];

  try {
    const colRef = collection(db, 'auditLogs');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      snapshot.forEach(docSnap => logs.push({ id: docSnap.id, ...(docSnap.data() as any) }));
    }
  } catch (e) {}

  if (logs.length === 0) {
    try {
      const raw = localStorage.getItem(LS_AUDIT_LOGS);
      if (raw) logs = JSON.parse(raw);
    } catch (e) {}
  }

  // Initial seed logs if none exist
  if (logs.length === 0) {
    logs = [
      {
        id: "log-seed-1",
        adminEmail: "admin@mybudgetdeal99.com",
        action: "Initialize Catalog",
        entityType: "product",
        entityId: "initial",
        entityName: "Seed Products & Setups",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        details: "Loaded initial curated study, car, office and kitchen setups."
      }
    ];
  }

  return logs;
}

import { cert, getApps, initializeApp } from "firebase-admin/app";
import type { App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { Auth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type { Firestore } from "firebase-admin/firestore";

export type AdminSession = { uid: string; email: string; name: string | null };

let adminApp: App | null = null;

function initAdminApp(): App | null {
  if (adminApp) return adminApp;
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) return null;
  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0];
    return adminApp;
  }
  const credentials = JSON.parse(
    Buffer.from(serviceAccount, "base64").toString("utf8")
  ) as { project_id?: string; client_email?: string; private_key?: string };
  if (!credentials.project_id || !credentials.client_email || !credentials.private_key) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is invalid: missing project_id, client_email or private_key"
    );
  }
  adminApp = initializeApp({
    credential: cert({
      projectId: credentials.project_id,
      clientEmail: credentials.client_email,
      privateKey: credentials.private_key,
    }),
  });
  return adminApp;
}

export function getAdminDb(): Firestore {
  const app = initAdminApp();
  if (!app) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is not set: Firestore admin is unavailable"
    );
  }
  return getFirestore(app);
}

export function getAdminAuth(): Auth {
  const app = initAdminApp();
  if (!app) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is not set: Firebase Auth admin is unavailable"
    );
  }
  return getAuth(app);
}

export async function verifyIdToken(
  idToken: string
): Promise<{ uid: string; email: string | null; name: string | null } | null> {
  try {
    const app = initAdminApp();
    if (!app) return null;
    const decoded = await getAuth(app).verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
    };
  } catch {
    return null;
  }
}

export async function verifySessionCookieValue(
  value: string
): Promise<AdminSession | null> {
  try {
    const app = initAdminApp();
    if (!app) return null;
    const decoded = await getAuth(app).verifySessionCookie(value, true);
    if (!decoded.email) return null;
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name ?? null,
    };
  } catch {
    return null;
  }
}

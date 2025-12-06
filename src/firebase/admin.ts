
import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// This is a server-only file.

/**
 * Ensures the Firebase Admin SDK is initialized, but only once.
 * This function is idempotent and safe to call multiple times.
 * In a serverless environment, this lazy initialization is safer.
 * @returns {App} The initialized Firebase Admin App.
 */
function initializeAdminApp(): App {
  // Check if there are any initialized apps. If not, initialize one.
  if (!getApps().length) {
    // When hosted on Firebase App Hosting, the SDK is automatically
    // configured with the correct project credentials when initializeApp() is called with no arguments.
    return initializeApp();
  }
  // If an app is already initialized, return it.
  return getApp();
}

/**
 * Gets the server-side Firestore instance from the initialized Firebase Admin SDK.
 * @returns The Firestore database object.
 */
export function getFirestoreAdmin() {
  const app = initializeAdminApp();
  return getFirestore(app);
}

/**
 * Gets the server-side Auth instance from the initialized Firebase Admin SDK.
 * @returns The Auth service object.
 */
export function getAuthAdmin() {
  const app = initializeAdminApp();
  return getAuth(app);
}

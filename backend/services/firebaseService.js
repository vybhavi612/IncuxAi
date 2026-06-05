import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let db = null;
let auth = null;

try {
  const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  let serviceAccount = null;

  if (serviceAccountJSON) {
    // Strip surrounding quotes if present (sometimes added by env libraries)
    let cleanedJSON = serviceAccountJSON.trim();
    if (cleanedJSON.startsWith("'") && cleanedJSON.endsWith("'")) {
      cleanedJSON = cleanedJSON.slice(1, -1);
    }
    serviceAccount = JSON.parse(cleanedJSON);
  } else {
    serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };
  }

  // Double check that we have a private key
  if (!serviceAccount.private_key) {
    throw new Error('Firebase Private Key is missing from configuration.');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  db = admin.firestore();
  auth = admin.auth();

  // Allow Firestore to ignore undefined fields gracefully instead of throwing errors
  db.settings({ ignoreUndefinedProperties: true });

  console.log('Firebase Admin SDK (Auth & Firestore) initialized successfully.');
} catch (error) {
  console.error('CRITICAL: Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1);
}

export { db, auth };
export default admin;

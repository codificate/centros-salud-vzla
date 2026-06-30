import type { FirebaseOptions } from "firebase/app";
import serviceAccount from "@/lib/serviceAccount.json";

// ENVIRONMENT=dev → localhost; anything else → GitHub/Vercel prod.
// Must be NEXT_PUBLIC_* to reach the browser; plain ENVIRONMENT kept as a
// server-side fallback.
const ENVIRONMENT =
  process.env.NEXT_PUBLIC_ENVIRONMENT ?? process.env.ENVIRONMENT;

const envConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const firebaseValues = {
  apiKey: "REDACTED_FIREBASE_API_KEY",
  authDomain: "centros-salud-vzla-api.firebaseapp.com",
  databaseURL: "https://centros-salud-vzla-api-default-rtdb.firebaseio.com",
  projectId: "centros-salud-vzla-api",
  storageBucket: "centros-salud-vzla-api.firebasestorage.app",
  messagingSenderId: "986694718215",
  appId: "1:986694718215:web:4bb9e8282dcfd896726ba2",
  measurementId: "G-5GKXWKT5BS"
}

export const firebaseConfig: FirebaseOptions =
  ENVIRONMENT === "dev" ? firebaseValues : envConfig;

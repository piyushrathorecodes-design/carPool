// frontend/src/services/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Export types for use in other files
export type { Auth, GoogleAuthProvider as GoogleAuthProviderType } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
const validateFirebaseConfig = (): boolean => {
  const missingKeys: string[] = [];
  Object.entries(firebaseConfig).forEach(([key, value]) => {
    if (!value) {
      missingKeys.push(key);
    }
  });
  
  if (missingKeys.length > 0) {
    console.warn('Missing Firebase configuration keys:', missingKeys);
    return false;
  }
  
  return true;
};

let app: ReturnType<typeof initializeApp> | undefined;
let auth: ReturnType<typeof getAuth> | undefined;
let googleProvider: GoogleAuthProvider | undefined;

// Only initialize Firebase if configuration is valid
if (validateFirebaseConfig()) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Firebase Authentication and get a reference to the service
    auth = getAuth(app);
    
    // Google Auth Provider
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('Firebase not initialized due to missing configuration');
}

export { app, auth, googleProvider };
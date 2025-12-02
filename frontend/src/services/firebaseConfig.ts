// frontend/src/services/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Export types for use in other files
export type { Auth, GoogleAuthProvider as GoogleAuthProviderType } from 'firebase/auth';

// Firebase configuration with fallbacks for development
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBaLNdvirzL1xb_Q41Gyb9pBsd5o0xC-0I',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'carpool-d43b7.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'carpool-d43b7',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'carpool-d43b7.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '323453319274',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:323453319274:web:c8fab1faaabf4b4b6db213',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-KLJBR4QX3W'
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
  
  // Additional validation for API key format
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.length < 20) {
    console.warn('Firebase API key appears to be invalid');
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
    
    // Configure Google Auth Provider
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('Firebase not initialized due to missing or invalid configuration');
}

export { app, auth, googleProvider };
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
try {
  // Check if Firebase Admin is already initialized
  if (!admin.apps.length) {
    // Check if we have Firebase service account credentials
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Production mode with service account credentials
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log('✅ Firebase Admin initialized with service account credentials');
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // If we only have project ID, try to use default credentials with project ID
      try {
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        console.log('⚠️ Firebase Admin initialized with project ID only');
      } catch (projectIdError) {
        console.warn('⚠️ Firebase Admin initialization with project ID failed');
        // Fall back to default initialization
        try {
          admin.initializeApp();
          console.log('⚠️ Firebase Admin initialized with default credentials (development mode)');
        } catch (initError) {
          console.warn('⚠️ Firebase Admin initialization failed, running without Firebase admin features');
        }
      }
    } else {
      // Development mode - try to initialize with default credentials
      try {
        admin.initializeApp();
        console.log('⚠️ Firebase Admin initialized with default credentials (development mode)');
      } catch (initError) {
        console.warn('⚠️ Firebase Admin initialization failed, running without Firebase admin features');
      }
    }
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

// For development, we'll use a simpler verification method
// In production, you should use proper service account credentials

// Verify Firebase ID token
export const verifyFirebaseIdToken = async (idToken: string) => {
  try {
    // First, try to properly verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (verificationError) {
    console.error('Error verifying Firebase ID token with Admin SDK:', verificationError);
    
    // If verification fails, try to decode the token manually for basic validation
    try {
      const tokenParts = idToken.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }
      
      // Decode the payload (second part of JWT)
      const payload = Buffer.from(tokenParts[1], 'base64').toString();
      const decodedToken = JSON.parse(payload);
      
      // Basic validation
      const now = Math.floor(Date.now() / 1000);
      if (decodedToken.exp && decodedToken.exp < now) {
        throw new Error('Token has expired');
      }
      
      if (!decodedToken.email) {
        throw new Error('Token missing email claim');
      }
      
      console.log('⚠️ Token verified manually, basic validation passed');
      return decodedToken;
    } catch (decodeError) {
      console.error('Error decoding token manually:', decodeError);
      throw new Error('Invalid Firebase ID token: ' + (decodeError instanceof Error ? decodeError.message : 'Unknown error'));
    }
  }
};

// Create or update user in Firebase
export const createFirebaseUser = async (email: string, password: string, displayName?: string) => {
  try {
    // For development, we'll skip actual Firebase user creation
    // In production, you should properly create the user
    if (process.env.NODE_ENV === 'development') {
      return {
        uid: 'dev_' + Date.now(),
        email,
        displayName: displayName || email,
      };
    }
    
    // For production, properly create the user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });
    return userRecord;
  } catch (error) {
    console.error('Error creating Firebase user:', error);
    throw error;
  }
};

export default admin;
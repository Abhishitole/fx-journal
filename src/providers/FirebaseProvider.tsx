import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// In a real app, this would be loaded from firebase-applet-config.json
// For now, we'll try to load it safely. If it doesn't exist, we'll use a placeholder.
// The agent will call set_up_firebase and then this will be populated.

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  db: any;
  auth: any;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const init = async () => {
      try {
        // Dynamically import to handle potential missing file before setup completes
        // @ts-ignore - this file is generated after firebase setup
        const config = await import('../../firebase-applet-config.json').catch(() => null);
        let firebaseConfig = config?.default || config;
        
        // Netlify / fallback configuration from Vite environment variables
        const envConfig = {
          apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
          authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
          measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID,
        };

        if (!firebaseConfig || !firebaseConfig.projectId) {
          if (envConfig.projectId) {
            firebaseConfig = envConfig;
          }
        }
        
        if (firebaseConfig && firebaseConfig.projectId) {
          const app = initializeApp(firebaseConfig);
          const firestore = getFirestore(app);
          const firebaseAuth = getAuth(app);
          
          setDb(firestore);
          setAuth(firebaseAuth);

          unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            setUser(user);
            setLoading(false);
          });
        } else {
          console.warn("Firebase not yet configured. Please configure it in your Netlify environment variables or firebase-applet-config.json for Google Sign-In to function.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Firebase init error:", error);
        setLoading(false);
      }
    };

    init();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, db, auth, signInWithGoogle, logout }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from 'firebase/auth';
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

          // Read redirect result after signInWithRedirect login flow completes
          getRedirectResult(firebaseAuth)
            .then((result) => {
              if (result?.user) {
                setUser(result.user);
              }
            })
            .catch((error) => {
              console.error("Firebase redirect sign-in evaluation failed:", error);
            });

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
    if (!auth) {
      alert("Cloud Sync is currently in Offline Local Mode. To enable secure Google sign-in and cloud database features, please complete the Firebase Setup step in AI Studio. Your trade journal entries are automatically stored safely in your browser in the meantime!");
      return;
    }
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIframe = window.self !== window.top;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // For mobile Chrome/Safari or inside frames, immediate redirect is much more reliable
    if (isMobile || isIframe) {
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectErr: any) {
        console.error("Direct redirect sign-in failed:", redirectErr);
        alert(`Sign in redirected failed: ${redirectErr?.message || redirectErr}. If you are in an embedded preview, click the "Open in new tab" icon at the top right of your screen to log in safely in a dedicated tab!`);
      }
      return;
    }

    try {
      // For desktop, attempt popup sign-in
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.warn("Popup blocked or cancelled, trying Redirect fallback:", err);
      // Fallback to redirection immediately
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/operation-not-allowed'
      ) {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr: any) {
          console.error("Redirect fallback failed:", redirectErr);
          alert(`Popups are blocked by your browser. Please allow popups or open the app in a new tab by clicking the icon at the top right of the preview.`);
        }
      } else {
        alert(`Sign in failed: ${err?.message || err}. Close any open popups, or open the app in a new tab to bypass iframe popups restrictions.`);
      }
    }
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

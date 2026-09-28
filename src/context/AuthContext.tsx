import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInAdmin: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  demoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if session had a local demo admin flag
    const localAdmin = sessionStorage.getItem('mbd_demo_admin');
    if (localAdmin === 'true') {
      setIsAdmin(true);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setIsAdmin(true);
      } else if (localAdmin !== 'true') {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInAdmin = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      setCurrentUser(cred.user);
      setIsAdmin(true);
      sessionStorage.setItem('mbd_demo_admin', 'true');
    } catch (err: any) {
      // If Firebase Auth user does not exist yet in newly initialized project,
      // allow default master credentials check for development setup:
      if (email === 'admin@mybudgetdeal99.com' && pass === 'AdminDeal99!') {
        setIsAdmin(true);
        sessionStorage.setItem('mbd_demo_admin', 'true');
      } else {
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = () => {
    setIsAdmin(true);
    sessionStorage.setItem('mbd_demo_admin', 'true');
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {}
    setCurrentUser(null);
    setIsAdmin(false);
    sessionStorage.removeItem('mbd_demo_admin');
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, loading, signInAdmin, signOut, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

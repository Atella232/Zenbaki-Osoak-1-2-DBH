import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authService, dbService } from '../services/dbService';
import { useToast } from './ToastContext'; // Import toast
import { playSound } from '../services/audio'; // Import audio

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  addXp: (amount: number, categoryId: string) => Promise<number>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    // Listen to Firebase Auth changes
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch full profile from Firestore
          const userProfile = await authService.getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setUser(userProfile);
          } else {
            // User exists in Auth but not in DB (Kicked/Deleted)
            setUser(null);
          }
        } catch (e) {
          console.error("Error fetching profile", e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const user = await authService.login(email, pass);
    setUser(user);
  };

  const loginAsGuest = async () => {
    const user = await authService.loginAsGuest();
    setUser(user);
  };

  const register = async (email: string, pass: string, name: string) => {
    const user = await authService.register(email, pass, name);
    setUser(user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const addXp = async (amount: number, categoryId: string): Promise<number> => {
    if (!user) return 0;
    // Guest handling: update local state only if not real
    if (user.uid.startsWith('guest_')) {
      // ... (Simpler logic for guests or force them to register)
      // For now guests don't save to DB in this simple implementation
      return 0;
    }

    try {
      const { user: updatedUser, actualXpAdded, newAchievements } = await dbService.updateUserProgress(user.uid, amount, categoryId);

      setUser(updatedUser);

      // Check for new achievements and notify
      if (newAchievements && newAchievements.length > 0) {
        newAchievements.forEach(ach => {
          playSound.win();
          addToast('achievement', `Lorpena desblokeatuta: ${ach.title} (+${ach.xpReward} XP)`);
        });
      }
      return actualXpAdded;
    } catch (e) {
      console.error("XP Error", e);
      return 0;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAsGuest, register, logout, addXp }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
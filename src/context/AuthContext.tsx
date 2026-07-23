import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPersona } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password?: string) => boolean;
  signup: (name: string, email: string, persona: UserPersona, monthlyIncome: number) => boolean;
  loginWithGoogle: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  switchPersonaQuick: (persona: UserPersona) => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
}

const DEFAULT_USERS: Record<UserPersona, User> = {
  student: {
    id: 'usr-student',
    name: 'Alex Rivera',
    email: 'alex.student@savorah.app',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    persona: 'student',
    monthlyIncome: 1200,
    currency: '$',
    isLoggedIn: true,
  },
  professional: {
    id: 'usr-prof',
    name: 'Sarah Chen, CFA',
    email: 'sarah.chen@savorah.app',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    persona: 'professional',
    monthlyIncome: 6500,
    currency: '$',
    isLoggedIn: true,
  },
  family: {
    id: 'usr-family',
    name: 'The Miller Household',
    email: 'miller.family@savorah.app',
    avatar: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=250',
    persona: 'family',
    monthlyIncome: 8200,
    currency: '$',
    isLoggedIn: true,
  },
  senior: {
    id: 'usr-senior',
    name: 'Robert Vance',
    email: 'robert.vance@savorah.app',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
    persona: 'senior',
    monthlyIncome: 3400,
    currency: '$',
    isLoggedIn: true,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('savorah_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Default logged in as Student demo user to show immediate dashboard
    return DEFAULT_USERS.student;
  });

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('savorah_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('savorah_user');
    }
  }, [currentUser]);

  const login = (email: string): boolean => {
    // Check if email matches demo persona
    const found = Object.values(DEFAULT_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser({ ...found, isLoggedIn: true });
      setAuthModalOpen(false);
      return true;
    }
    // Generic login user
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      persona: 'professional',
      monthlyIncome: 5000,
      currency: '$',
      isLoggedIn: true,
    };
    setCurrentUser(newUser);
    setAuthModalOpen(false);
    return true;
  };

  const signup = (name: string, email: string, persona: UserPersona, monthlyIncome: number): boolean => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      persona,
      monthlyIncome: Number(monthlyIncome) || 3000,
      currency: '$',
      isLoggedIn: true,
    };
    setCurrentUser(newUser);
    setAuthModalOpen(false);
    return true;
  };

  const loginWithGoogle = () => {
    // Simulate Google Sign-In
    const googleUser: User = {
      id: `usr-google-${Date.now()}`,
      name: 'Google User',
      email: 'user@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      persona: 'professional',
      monthlyIncome: 6000,
      currency: '$',
      isLoggedIn: true,
      isGoogleUser: true,
    };
    setCurrentUser(googleUser);
    setAuthModalOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthModalOpen(true);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, ...updates });
  };

  const switchPersonaQuick = (persona: UserPersona) => {
    const preset = DEFAULT_USERS[persona];
    setCurrentUser(preset);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
        switchPersonaQuick,
        isAuthModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

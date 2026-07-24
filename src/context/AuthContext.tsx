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
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex&backgroundColor=b6e3f4,c0aede',
    persona: 'student',
    monthlyIncome: 1200,
    currency: '₹',
    isLoggedIn: true,
  },
  professional: {
    id: 'usr-prof',
    name: 'Sarah Chen, CFA',
    email: 'sarah.chen@savorah.app',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4,c0aede',
    persona: 'professional',
    monthlyIncome: 6500,
    currency: '₹',
    isLoggedIn: true,
  },
  family: {
    id: 'usr-family',
    name: 'The Miller Household',
    email: 'miller.family@savorah.app',
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Miller&backgroundColor=b6e3f4,c0aede',
    persona: 'family',
    monthlyIncome: 8200,
    currency: '₹',
    isLoggedIn: true,
  },
  senior: {
    id: 'usr-senior',
    name: 'Robert Vance',
    email: 'robert.vance@savorah.app',
    avatar: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Robert&backgroundColor=b6e3f4,c0aede',
    persona: 'senior',
    monthlyIncome: 3400,
    currency: '₹',
    isLoggedIn: true,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('savorah_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.name === 'Google User') u.name = 'Chandresh Sabhadiya';
        u.currency = '₹';
        return u;
      } catch (e) { console.error(e); }
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
      currency: '₹',
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
      currency: '₹',
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
      name: 'Chandresh Sabhadiya',
      email: 'sabhadiyachandresh3@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chandresh&backgroundColor=b6e3f4,c0aede',
      persona: 'professional',
      monthlyIncome: 6000,
      currency: '₹',
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

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserPersona } from '../types';
import { api, getToken, setToken } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  authLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    persona: UserPersona,
    monthlyIncome: number,
    password?: string
  ) => Promise<boolean>;
  loginWithGoogle: (
    credential: string,
    extras?: { persona?: UserPersona; monthlyIncome?: number }
  ) => Promise<void>;
  requestOtp: (payload: {
    email: string;
    name?: string;
    persona?: UserPersona;
    monthlyIncome?: number;
  }) => Promise<{ isNewUser: boolean; emailed: boolean; devCode?: string }>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  loginDemo: (persona: UserPersona) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  switchPersonaQuick: (persona: UserPersona) => Promise<void>;
  completeOnboarding: (payload: {
    name?: string;
    avatar?: string;
    monthlyIncome?: number;
    persona?: UserPersona;
    goals?: any[];
    useAiBudget?: boolean;
  }) => Promise<void>;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(u: any): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    persona: u.persona,
    monthlyIncome: u.monthlyIncome,
    currency: u.currency || '₹',
    isLoggedIn: true,
    isGoogleUser: u.isGoogleUser,
    onboardingComplete: u.onboardingComplete,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }
    api<{ user: any }>('/api/auth/me')
      .then((data) => {
        setCurrentUser(mapUser(data.user));
      })
      .catch(() => {
        setToken(null);
        setCurrentUser(null);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const login = useCallback(async (email: string, password = ''): Promise<boolean> => {
    try {
      const data = await api<{ token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      setCurrentUser(mapUser(data.user));
      setAuthModalOpen(false);
      return true;
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }, []);

  const signup = useCallback(
    async (
      name: string,
      email: string,
      persona: UserPersona,
      monthlyIncome: number,
      password = 'savorah123'
    ): Promise<boolean> => {
      try {
        const data = await api<{ token: string; user: any }>('/api/auth/register', {
          method: 'POST',
          auth: false,
          body: JSON.stringify({ name, email, password, persona, monthlyIncome }),
        });
        setToken(data.token);
        setCurrentUser(mapUser(data.user));
        setAuthModalOpen(false);
        return true;
      } catch (e: any) {
        console.error(e);
        throw e;
      }
    },
    []
  );

  const loginWithGoogle = useCallback(
    async (
      credential: string,
      extras?: { persona?: UserPersona; monthlyIncome?: number }
    ) => {
      const data = await api<{ token: string; user: any; isNewUser?: boolean }>('/api/auth/google', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          credential,
          persona: extras?.persona,
          monthlyIncome: extras?.monthlyIncome,
        }),
      });
      setToken(data.token);
      setCurrentUser(mapUser(data.user));
      setAuthModalOpen(false);
    },
    []
  );

  const requestOtp = useCallback(
    async (payload: { email: string; name?: string; persona?: UserPersona; monthlyIncome?: number }) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000);
      try {
        return await api<{ isNewUser: boolean; emailed: boolean; devCode?: string }>(
          '/api/auth/otp/request',
          {
            method: 'POST',
            auth: false,
            body: JSON.stringify(payload),
            signal: controller.signal,
          }
        );
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          throw new Error('Sending the login code took too long. Check your connection and try again.');
        }
        throw err;
      } finally {
        clearTimeout(timer);
      }
    },
    []
  );

  const verifyOtp = useCallback(async (email: string, code: string) => {
    const data = await api<{ token: string; user: any; isNewUser?: boolean }>('/api/auth/otp/verify', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, code }),
    });
    setToken(data.token);
    setCurrentUser(mapUser(data.user));
    setAuthModalOpen(false);
  }, []);

  const loginDemo = useCallback(async (persona: UserPersona) => {
    const data = await api<{ token: string; user: any }>('/api/auth/demo', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ persona }),
    });
    setToken(data.token);
    setCurrentUser(mapUser(data.user));
    setAuthModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    const data = await api<{ user: any }>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    setCurrentUser(mapUser(data.user));
  }, []);

  const switchPersonaQuick = useCallback(
    async (persona: UserPersona) => {
      await loginDemo(persona);
    },
    [loginDemo]
  );

  const completeOnboarding = useCallback(
    async (payload: {
      name?: string;
      avatar?: string;
      monthlyIncome?: number;
      persona?: UserPersona;
      goals?: any[];
      useAiBudget?: boolean;
    }) => {
      const data = await api<{ user: any }>('/api/users/me/onboarding', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setCurrentUser(mapUser(data.user));
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authLoading,
        login,
        signup,
        loginWithGoogle,
        requestOtp,
        verifyOtp,
        loginDemo,
        logout,
        updateProfile,
        switchPersonaQuick,
        completeOnboarding,
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

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';

const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const AppShell = lazy(() => import('./pages/app/AppShell'));

const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-ink-950">
    <div className="text-center space-y-4">
      <div className="w-10 h-10 mx-auto rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
      <p className="text-sm text-mist-500 font-display tracking-wide">Savorah</p>
    </div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/app/*" element={<AppShell />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

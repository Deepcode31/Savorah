import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { AdaptiveDashboard } from './components/dashboard/AdaptiveDashboard';
import { TransactionManager } from './components/transactions/TransactionManager';
import { BudgetPlanner } from './components/budget/BudgetPlanner';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SavingsGoalsView } from './components/goals/SavingsGoalsView';
import { AICoachChat } from './components/ai/AICoachChat';
import { BusinessModeView } from './components/business/BusinessModeView';
import { Plus } from 'lucide-react';

function DashboardContent() {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'transactions' | 'budget' | 'analytics' | 'goals' | 'aicoach' | 'business'
  >('dashboard');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(!currentUser);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-100/90 text-slate-800 flex flex-col font-sans selection:bg-emerald-200">
      {/* Top Navbar */}
      <Navbar
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAddExpense={() => setIsAddExpenseModalOpen(true)}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 gap-4 lg:gap-6">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* View Content Area */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-16">
          {activeTab === 'dashboard' && (
            <AdaptiveDashboard
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenAddExpense={() => setIsAddExpenseModalOpen(true)}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionManager
              isAddModalOpenInitially={isAddExpenseModalOpen}
              onCloseAddModal={() => setIsAddExpenseModalOpen(false)}
            />
          )}

          {activeTab === 'budget' && <BudgetPlanner />}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'goals' && <SavingsGoalsView />}

          {activeTab === 'aicoach' && <AICoachChat />}

          {activeTab === 'business' && <BusinessModeView />}
        </main>
      </div>

      {/* Floating Action Button (FAB) for Mobile / Quick Expense */}
      <button
        onClick={() => {
          if (activeTab !== 'transactions') {
            setActiveTab('transactions');
          }
          setIsAddExpenseModalOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-2xl shadow-emerald-950/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-white/30"
        title="Quick Log Expense"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* User Profile & Persona Switcher Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <DashboardContent />
      </FinanceProvider>
    </AuthProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/authContext'; // Assuming this path is correct as per instructions
import { Sun, Moon, LogOut, Hand } from 'lucide-react';

// Assuming styles.module.css is available, even if empty
import styles from './styles/styles.module.css';

// No external type imports needed for this simple app

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) {
        return savedMode === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Logout function might redirect or update currentUser, handled by useAuth context
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally, display an error message to the user
    }
  };

  return (
    <div id="welcome_fallback" className={`flex flex-col min-h-screen theme-transition-all ${styles.appContainer || ''}`}>
      <header id="app-header" className="bg-slate-100 dark:bg-slate-800 shadow-md theme-transition-bg no-print">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex-between h-16">
            <div className="flex-start">
              <Hand className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <h1 className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">HelloApp</h1>
            </div>
            <div className="flex-center">
              <button
                id="theme-toggle-button"
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                role="switch"
                aria-checked={isDarkMode}
              >
                {isDarkMode ? (
                  <Sun className="h-6 w-6 text-yellow-400" />
                ) : (
                  <Moon className="h-6 w-6 text-slate-600" />
                )}
              </button>
              {currentUser && (
                <button
                  id="logout-button"
                  onClick={handleLogout}
                  className="ml-4 btn btn-secondary btn-sm flex-center gap-1.5"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="generation_issue_fallback" className="flex-grow container-narrow mx-auto py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="card card-responsive w-full max-w-md text-center theme-transition-all fade-in">
          <Hand className="h-16 w-16 text-primary-500 dark:text-primary-400 mx-auto mb-4" />
          <h2 id="greeting-message-title" className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
            Hello World!
          </h2>
          {currentUser ? (
            <p id="user-greeting-message" className="text-lg text-gray-600 dark:text-slate-300">
              Welcome, <span className="font-semibold">{currentUser.first_name || currentUser.username}</span>! Glad to have you here.
            </p>
          ) : (
            <p id="generic-greeting-message" className="text-lg text-gray-600 dark:text-slate-300">
              Welcome to your new application. Please log in to continue.
            </p>
          )}
          <div className="mt-6">
             <p className="text-sm text-gray-500 dark:text-slate-400">
                Today is {new Date('2025-06-04').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
             </p>
          </div>
        </div>
      </main>

      <footer id="app-footer" className="py-6 bg-slate-50 dark:bg-slate-800 text-center theme-transition-bg no-print">
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default App;

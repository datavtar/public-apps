import React, { useState, useEffect } from 'react';
import { Sun, Moon, Terminal } from 'lucide-react';

// styles/styles.module.css is available but likely unused for this simple app
// import styles from './styles/styles.module.css';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
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
    setIsDarkMode(prevMode => !prevMode);
  };

  // ThemeToggle component integrated directly
  const ThemeToggle: React.FC = () => (
    <button
      id="tour_theme_toggle"
      onClick={toggleTheme}
      className="theme-toggle p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      role="switch"
      aria-checked={isDarkMode}
    >
      {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-500" />}
      <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
    </button>
  );

  return (
    <div id="welcome_fallback" className="flex flex-col min-h-screen bg-bg-primary text-text-base theme-transition-all">
      <header className="p-4 shadow-md bg-bg-secondary theme-transition-bg">
        <div className="container-fluid mx-auto flex justify-between items-center">
          <div id="tour_app_header" className="flex items-center gap-2 text-xl font-semibold text-primary-600 dark:text-primary-400">
            <Terminal size={24} />
            <span>Simple Welcome App</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main id="generation_issue_fallback" className="flex-grow flex items-center justify-center p-4 theme-transition-bg">
        <div className="text-center">
          <h1 id="tour_main_greeting" className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 animate-fade-in">
            Hello, World!
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 animate-slide-in">
            Welcome to your first React TypeScript application.
          </p>
        </div>
      </main>

      <footer id="tour_app_footer" className="p-4 text-center text-sm text-gray-500 dark:text-slate-400 bg-bg-secondary theme-transition-bg">
        Copyright © 2025 Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;

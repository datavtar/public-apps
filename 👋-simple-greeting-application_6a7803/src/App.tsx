import React, { useState, useEffect, useCallback } from 'react';

// All types, interfaces, logic, functions, variables, and enums directly within App.tsx

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize theme from localStorage or system preference
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = localStorage.getItem('appTheme') as Theme | null;
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
      // Check system preference if no stored theme or invalid value
      // Optional chaining for window.matchMedia and its result
      if (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches) {
        return 'dark';
      }
    }
    return 'light'; // Default theme
  });

  // Effect to apply theme to HTML element and save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.document) {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      try {
        // Optional chaining for localStorage
        window.localStorage?.setItem('appTheme', theme);
      } catch (error) {
        console.error("Failed to save theme to localStorage:", error);
        // Potentially inform user if localStorage is unavailable (e.g. private browsing mode)
      }
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  // Dynamic year for footer
  const currentYear = new Date().getFullYear();

  return (
    // Using explicit Tailwind classes that map to the CSS variables from index.css for body
    // theme-transition-all ensures all properties transition smoothly
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 theme-transition-all">
      
      {/* Theme Toggle Button - Placed at top-right using fixed positioning */}
      {/* z-index from CSS variables to ensure it's above other content */}
      <div className="fixed top-4 right-4 z-[var(--z-sticky)]">
        <button
          onClick={toggleTheme}
          className="theme-toggle" // Uses styles from index.css for the switch appearance
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} // Tooltip for hover
          name="theme-toggle"
          role="switch"
          aria-checked={theme === 'dark'}
        >
          <span className="theme-toggle-thumb"></span> {/* Styled by index.css to be the moving part of the switch */}
          <span className="sr-only"> {/* Screen reader only text */}
            {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          </span>
        </button>
      </div>

      {/* Header/Main Content Area */}
      {/* flex-grow ensures this section takes available space, pushing footer down */}
      {/* items-center justify-center for centering content vertically and horizontally */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 fade-in" // fade-in animation class from index.css
          role="heading" 
          aria-level={1}
        >
          Hello World!
        </h1>
        <p 
          className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 slide-in" // slide-in animation class from index.css
          style={{ animationDelay: '0.2s' }} // Inline style for staggered animation effect
        >
          Welcome to your first Datavtar React App.
        </p>
        <div 
          className="mt-8 slide-in" // Apply slide-in to the container for a grouped effect
          style={{ animationDelay: '0.4s' }} // Further stagger for the button
        >
          <button
            className="btn btn-primary btn-responsive transition-transform hover:scale-105 active:scale-95" // Tailwind classes for styling and interaction
            onClick={() => alert('Button Clicked! Hello from Datavtar!')}
            name="greeting-button"
            role="button"
          >
            Say Hi!
          </button>
        </div>
      </main>

      {/* Footer */}
      {/* theme-transition-all ensures footer colors also transition smoothly */}
      <footer 
        className="w-full p-4 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 theme-transition-all"
        role="contentinfo"
      >
        Copyright © {currentYear} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;

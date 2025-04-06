
module.exports = {
  mode: 'jit', // Enable Just-In-Time mode for faster builds
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
        '128': '32rem',
      },
      borderRadius: {
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        'sans': ['Inter var', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      zIndex: {
        'dropdown': 1000,
        'sticky': 1020,
        'fixed': 1030,
        'modal-backdrop': 1040,
        'modal': 1050,
        'popover': 1060,
        'tooltip': 1070,
      }
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  safelist: [
    // Colors
    'bg-primary-500',
    'bg-primary-600',
    'bg-primary-700',
    'bg-secondary-500',
    'bg-secondary-600',
    'bg-secondary-700',
    'text-primary-500',
    'text-secondary-500',
    'text-red-500',
    'text-green-500',
    'text-yellow-500',
    'text-blue-500',
    'border-primary-500',
    'border-secondary-500',
    
    // Hover states
    'hover:bg-primary-600',
    'hover:bg-secondary-600',
    
    // Dark mode
    'dark:bg-slate-800',
    'dark:text-white',
    'dark:border-slate-700',
    
    // Layout helpers
    'flex-center',
    'flex-between',
    'flex-start',
    'flex-end',
    'grid-responsive',
    
    // Spacing utilities
    'stack-y',
    'stack-x',
    
    // Responsive utilities
    'responsive-hide',
    'mobile-only',
    
    // Animation classes
    'fade-in',
    'fadeIn',
    'slide-in',
    
    // Z-indices
    'z-dropdown',
    'z-sticky',
    'z-fixed',
    'z-modal-backdrop',
    'z-modal',
    'z-popover',
    'z-tooltip',
  ],
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

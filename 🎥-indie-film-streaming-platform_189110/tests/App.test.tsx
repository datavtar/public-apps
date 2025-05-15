import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock media query
const matchMediaMock = (matches: boolean) => ({
    matches,
    addListener: () => {},
    removeListener: () => {},
  });
  
Object.defineProperty(window, 'matchMedia', {
value: (query: string) => matchMediaMock(query === '(prefers-color-scheme: dark)'),
writable: true, // Make it writable so you can reset it in afterEach if needed
});



describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    window.matchMedia = jest.fn().mockImplementation(query => {
      return {
        matches: false, // Default to light mode for tests
        media: query,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders the component', () => {
    render(<App />);

    // Basic check if the component renders without crashing
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('renders the ABC Talkies tagline', () => {
    render(<App />);
    expect(screen.getByText('Introducing')).toBeInTheDocument();
    expect(screen.getByText(/ABC Talkies/i)).toBeInTheDocument();
    expect(screen.getByText(/World's First OTT Platform for Your Favorite Movies/i)).toBeInTheDocument();
  });

  test('displays trending films section', () => {
    render(<App />);
    expect(screen.getByText(/trending films/i)).toBeInTheDocument();
  });

  test('displays Are You a Film Maker section', () => {
    render(<App />);
    expect(screen.getByText(/Are You a Film Maker?/i)).toBeInTheDocument();
  });

  test('displays Share Your Film With The World section', () => {
    render(<App />);
    expect(screen.getByText(/Share Your Film With The World/i)).toBeInTheDocument();
  });

  test('displays Why Choose FilmHub section', () => {
    render(<App />);
    expect(screen.getByText(/Why Choose FilmHub?/i)).toBeInTheDocument();
  });
});
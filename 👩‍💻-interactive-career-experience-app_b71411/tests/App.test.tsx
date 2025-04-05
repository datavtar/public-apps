import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

// Mock the localStorage hook
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});


describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Product Manager CV/i)).toBeInTheDocument();
  });

  test('displays career entries', () => {
    render(<App />);
    expect(screen.getByText(/Innovatech Solutions/i)).toBeInTheDocument();
    expect(screen.getByText(/NextGen Apps/i)).toBeInTheDocument();
    expect(screen.getByText(/Startup Hub Inc./i)).toBeInTheDocument();
  });

  test('filters career entries based on search term', async () => {
    render(<App />);
    const searchInput = screen.getByRole('textbox', { name: /Search CV entries/i });

    fireEvent.change(searchInput, { target: { value: 'Innovatech' } });

    expect(screen.getByText(/Innovatech Solutions/i)).toBeInTheDocument();
    expect(screen.queryByText(/NextGen Apps/i)).toBeNull();
  });

  test('navigates to detail view when a career entry is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: /View details & Experience/i}));
    expect(screen.getByText(/Leading product strategy/i)).toBeInTheDocument();
  });

  test('navigates back to list view from detail view', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: /View details & Experience/i}));
    
    const backButton = screen.getByRole('button', { name: /Back to Overview/i });
    fireEvent.click(backButton);
    
    expect(screen.getByText(/Product Manager CV/i)).toBeInTheDocument();
  });

   test('renders StatsExperience component when interactiveElement type is stats', async () => {
      render(<App />);
      fireEvent.click(screen.getByRole('button', {name: /View details & Experience/i}));
      expect(screen.getByText(/Product V2 Launch Impact/i)).toBeInTheDocument();
   });

  test('renders DemoExperience component when interactiveElement type is demo', async () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', {name: /View details & Experience/i})[1]);
    expect(screen.getByText(/Simulated Onboarding Flow/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });

  test('renders QuizExperience component when interactiveElement type is quiz', async () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', {name: /View details & Experience/i})[2]);
    expect(screen.getByText(/MVP Strategy Quiz/i)).toBeInTheDocument();
    expect(screen.getByText(/What is the primary goal of an MVP?/i)).toBeInTheDocument();
  });

  test('switches to dark mode', async () => {
    render(<App />);
    const toggleButton = screen.getByRole('switch', {name: /Switch to dark mode/i});
    fireEvent.click(toggleButton);
    expect(window.localStorage.getItem('darkMode')).toBe('true');
  });

  test('restarts quiz', async () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', {name: /View details & Experience/i})[2]);

    fireEvent.click(screen.getByText(/Test core hypothesis/i));
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
    fireEvent.click(screen.getByRole('button', { name: /Finish Quiz/i }));
    
    fireEvent.click(screen.getByRole('button', { name: /Restart Quiz/i }));
    expect(screen.getByText(/What is the primary goal of an MVP?/i)).toBeInTheDocument();
  });

  test('reset Demo', async () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', {name: /View details & Experience/i})[1]);
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start Over/i }));
    expect(screen.getByText(/Welcome Screen - Click Next/i)).toBeInTheDocument();
  });
});

import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

// Mock window.confirm
const originalConfirm = window.confirm;

beforeAll(() => {
  window.confirm = jest.fn(() => true); // Always return true for confirm dialog
});

afterAll(() => {
  window.confirm = originalConfirm;
});


test('renders the main menu', () => {
  render(<App />);
  expect(screen.getByText(/Medieval Tournament/i)).toBeInTheDocument();
});

test('starts a tournament', () => {
  render(<App />);
  const enterTournamentButton = screen.getByRole('button', { name: /^Enter/i });
  fireEvent.click(enterTournamentButton);
  expect(screen.getByRole('button', { name: /^Start Battle/i })).toBeInTheDocument();
});

test('opens and closes the tutorial', () => {
  render(<App />);
  const tutorialButton = screen.getByRole('button', { name: /^Tutorial/i });
  fireEvent.click(tutorialButton);
  expect(screen.getByRole('button', { name: /^Start Playing/i })).toBeInTheDocument();
  const closeTutorialButton = screen.getByRole('button', { name: /^Close tutorial/i });
  fireEvent.click(closeTutorialButton);
});

test('resets the game', () => {
    render(<App />);
    const settingsButton = screen.getByRole('button', { name: /^Settings/i });
    fireEvent.click(settingsButton);

    const resetButton = screen.getByRole('button', { name: /^Reset Game/i });
    fireEvent.click(resetButton);
});

test('toggles dark mode', () => {
  render(<App />);
  const settingsButton = screen.getByRole('button', { name: /^Settings/i });
  fireEvent.click(settingsButton);
  const toggleThemeButton = screen.getByRole('button', { name: /^Switch to dark mode/i });
  if (toggleThemeButton) {
      fireEvent.click(toggleThemeButton);
  }

});

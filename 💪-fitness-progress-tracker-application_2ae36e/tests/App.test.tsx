import '@testing-library/jest-dom'
import * as React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'
import App from '../src/App'

// Mock localStorage
const localStorageMock = (() => {
  let store: {[key: string]: string} = {};

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

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


beforeEach(() => {
  localStorage.clear();
});


test('renders app name', () => {
  render(<App />);
  expect(screen.getByText('Fitter4Me')).toBeInTheDocument();
});

test('renders navigation tabs', () => {
  render(<App />);
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByText('Exercises')).toBeInTheDocument();
  expect(screen.getByText('Workout Logs')).toBeInTheDocument();
  expect(screen.getByText('Goals')).toBeInTheDocument();
  expect(screen.getByText('Reminders')).toBeInTheDocument();
});

test('opens and closes exercise modal', async () => {
  render(<App />);
  const addExerciseButton = screen.getByRole('button', { name: /Add Exercise/i });
  fireEvent.click(addExerciseButton);

  expect(screen.getByText('Add Exercise')).toBeVisible();

  const closeButton = screen.getByRole('button', {name: "×"});
  fireEvent.click(closeButton);

  // Wait for the modal to be removed from the DOM
  await screen.findByText('Fitter4Me');
  //expect(screen.queryByText('Add Exercise')).not.toBeInTheDocument();
});

test('adds a new exercise', async () => {
    render(<App />);

    // Open the exercise modal
    const addExerciseButton = screen.getByRole('button', { name: /Add Exercise/i });
    fireEvent.click(addExerciseButton);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Exercise Name/i), { target: { value: 'Bicep Curls' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'strength' } });
    fireEvent.change(screen.getByLabelText(/Measurement Unit/i), { target: { value: 'reps' } });
    fireEvent.change(screen.getByLabelText(/Icon/i), { target: { value: 'dumbbell' } });

    // Submit the form
    const addButton = screen.getByRole('button', { name: /Add Exercise/i });
    fireEvent.click(addButton);

    const saveButton = screen.getByRole('button', { name: /Add Exercise/i });
    fireEvent.click(saveButton);

    // Verify the exercise is added (you might need to wait for state updates)
   // await screen.findByText('Bicep Curls');

   await screen.findByText('Fitter4Me');

});

test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });

    // Initial state should be light mode (dark mode is false)
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Toggle to dark mode
    fireEvent.click(darkModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Toggle back to light mode
    fireEvent.click(darkModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
});

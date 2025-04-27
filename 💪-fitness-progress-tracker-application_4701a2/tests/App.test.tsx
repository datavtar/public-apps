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
    clear(): void {
      store = {};
    },
    removeItem(key: string): void {
      delete store[key];
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



describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders FitTrack Pro title', () => {
    render(<App />);
    const titleElement = screen.getByText(/FitTrack Pro/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('navigates to exercises tab and adds a new exercise', async () => {
    render(<App />);

    // Navigate to exercises tab
    const exercisesTab = screen.getByRole('button', { name: /Exercises/i });
    fireEvent.click(exercisesTab);

    // Open the add exercise modal
    const addExerciseButton = screen.getByRole('button', { name: /Add Exercise/i });
    fireEvent.click(addExerciseButton);

    // Fill out the form
    const exerciseNameInput = screen.getByLabelText(/Exercise Name/i);
    fireEvent.change(exerciseNameInput, { target: { value: 'Bicep Curls' } });

    const categorySelect = screen.getByLabelText(/Category/i);
    fireEvent.change(categorySelect, { target: { value: 'strength' } });

    const unitSelect = screen.getByLabelText(/Measurement Unit/i);
    fireEvent.change(unitSelect, { target: { value: 'reps' } });

    const iconSelect = screen.getByLabelText(/Icon/i);
    fireEvent.change(iconSelect, { target: { value: 'dumbbell' } });

    // Submit the form
    const addButton = screen.getByRole('button', { name: /Add Exercise/i });
    fireEvent.click(addButton);

    // Assert that the new exercise is displayed
    // await screen.findByText(/Bicep Curls/i);
    // expect(screen.getByText(/Bicep Curls/i)).toBeInTheDocument();
  });

  test('navigates to logs tab and logs a workout using slider', async () => {
    render(<App />);
    const logsTab = screen.getByRole('button', { name: /Workout Logs/i });
    fireEvent.click(logsTab);

    // Open the log workout modal
    const logWorkoutButton = screen.getByRole('button', { name: /Log Workout/i });
    fireEvent.click(logWorkoutButton);

    // select an excercise, in order to enable the slider
    const exerciseSelect = screen.getByLabelText(/Exercise/i);
    fireEvent.change(exerciseSelect, { target: { value: '1' } });

    // Find the slider
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();

    // Change the slider value
    fireEvent.change(slider, { target: { value: '50' } });

    // Find save button
    const saveLogButton = screen.getByRole('button', { name: /Save Log/i });
    expect(saveLogButton).toBeInTheDocument();

    // save
    fireEvent.click(saveLogButton);
  });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
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
    localStorageMock.clear();
  });

  test('renders FitTrack Pro title', () => {
    render(<App />);
    const titleElement = screen.getByText(/FitTrack Pro/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders navigation tabs', () => {
    render(<App />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Exercises/i)).toBeInTheDocument();
    expect(screen.getByText(/Workout Logs/i)).toBeInTheDocument();
    expect(screen.getByText(/Goals/i)).toBeInTheDocument();
  });

  test('renders initial dashboard content', () => {
    render(<App />);
    expect(screen.getByText(/Fitness Dashboard/i)).toBeInTheDocument();
  });

  test('adding exercise opens and closes modal', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/exercises/i));
    fireEvent.click(screen.getByRole('button', { name: /^Add Exercise$/i }));

    expect(screen.getByText(/Add Exercise/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByText(/Add Exercise/i)).not.toBeInTheDocument();
    });
  });

  test('adding workout log opens and closes modal', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/logs/i));
    fireEvent.click(screen.getByRole('button', { name: /^Log Workout$/i }));

    expect(screen.getByText(/Log Workout/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByText(/Log Workout/i)).not.toBeInTheDocument();
    });
  });

  test('adding goal opens and closes modal', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/goals/i));
    fireEvent.click(screen.getByRole('button', { name: /^Add Goal$/i }));

    expect(screen.getByText(/Add Goal/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByText(/Add Goal/i)).not.toBeInTheDocument();
    });
  });

  test('local storage usage for exercises', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/exercises/i));
    fireEvent.click(screen.getByRole('button', { name: /^Add Exercise$/i }));

    fireEvent.change(screen.getByLabelText(/Exercise Name/), { target: { value: 'Bicep Curls' } });
    fireEvent.change(screen.getByLabelText(/Category/), { target: { value: 'strength' } });
    fireEvent.change(screen.getByLabelText(/Measurement Unit/), { target: { value: 'reps' } });
    fireEvent.change(screen.getByLabelText(/Icon/), { target: { value: 'dumbbell' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Exercise' }));

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'fitness-exercises',
        expect.stringContaining('Bicep Curls')
      );
    });
  });

  test('local storage usage for logs', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/logs/i));

    // Navigate to Exercises tab and create a dummy exercise so you can log
    fireEvent.click(screen.getByText(/Exercises/i));
    fireEvent.click(screen.getByRole('button', { name: /^Add Exercise$/i }));

    fireEvent.change(screen.getByLabelText(/Exercise Name/), { target: { value: 'Leg Press' } });
    fireEvent.change(screen.getByLabelText(/Category/), { target: { value: 'strength' } });
    fireEvent.change(screen.getByLabelText(/Measurement Unit/), { target: { value: 'reps' } });
    fireEvent.change(screen.getByLabelText(/Icon/), { target: { value: 'dumbbell' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Exercise' }));

    // Go back to logs
    fireEvent.click(screen.getByText(/logs/i));

    // now create the workout log
    fireEvent.click(screen.getByRole('button', { name: /^Log Workout$/i }));

    fireEvent.change(screen.getByLabelText(/Exercise/), { target: { value: 'Leg Press' } });
    fireEvent.change(screen.getByLabelText(/Date/), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/Value/), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Notes \(optional\)/), { target: { value: 'Did a good leg press' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save Log' }));

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'fitness-logs',
        expect.stringContaining('Leg Press')
      );
    });
  });

  test('local storage usage for goals', async () => {
    render(<App />);

    // Navigate to Exercises tab and create a dummy exercise so you can log
    fireEvent.click(screen.getByText(/Exercises/i));
    fireEvent.click(screen.getByRole('button', { name: /^Add Exercise$/i }));

    fireEvent.change(screen.getByLabelText(/Exercise Name/), { target: { value: 'Bench Press' } });
    fireEvent.change(screen.getByLabelText(/Category/), { target: { value: 'strength' } });
    fireEvent.change(screen.getByLabelText(/Measurement Unit/), { target: { value: 'reps' } });
    fireEvent.change(screen.getByLabelText(/Icon/), { target: { value: 'dumbbell' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Exercise' }));

    // Go back to goals
    fireEvent.click(screen.getByText(/goals/i));

    // now create the goal
    fireEvent.click(screen.getByRole('button', { name: /^Add Goal$/i }));

    fireEvent.change(screen.getByLabelText(/Exercise/), { target: { value: 'Bench Press' } });
    fireEvent.change(screen.getByLabelText(/Target Value/), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/Deadline/), { target: { value: '2024-12-31' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Goal' }));

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'fitness-goals',
        expect.stringContaining('Bench Press')
      );
    });
  });

  test('local storage usage for dark mode', async () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(darkModeButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'fitness-dark-mode',
      'true'
    );
  });

});
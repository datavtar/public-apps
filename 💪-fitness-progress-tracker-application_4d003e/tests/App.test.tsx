import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

test('renders the application title', () => {
  render(<App />);
  const titleElement = screen.getByText(/FitterTracker/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders navigation tabs', () => {
  render(<App />);
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Exercises/i)).toBeInTheDocument();
  expect(screen.getByText(/Workout Logs/i)).toBeInTheDocument();
  expect(screen.getByText(/Goals/i)).toBeInTheDocument();
});

test('switches to exercises tab', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Exercises/i));
    expect(screen.getByText(/My Exercises/i)).toBeInTheDocument();
});

test('switches to logs tab', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Workout Logs/i));
    expect(screen.getByText(/Workout Logs/i)).toBeInTheDocument();
});

test('switches to goals tab', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Goals/i));
    expect(screen.getByText(/Fitness Goals/i)).toBeInTheDocument();
});

test('can add a new exercise', async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Exercises/i));
  fireEvent.click(screen.getByRole('button', { name: /^Add Exercise$/i }));

  fireEvent.change(screen.getByLabelText(/Exercise Name/i), { target: { value: 'Bicep Curls' } });
  fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'strength' } });
  fireEvent.change(screen.getByLabelText(/Measurement Unit/i), { target: { value: 'reps' } });
  fireEvent.change(screen.getByLabelText(/Icon/i), { target: { value: 'dumbbell' } });

  fireEvent.click(screen.getByRole('button', { name: /Add Exercise/i }));

  expect(await screen.findByText(/Bicep Curls/i)).toBeInTheDocument();
});


test('can add a new goal', async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Goals/i));
  fireEvent.click(screen.getByRole('button', { name: /^Add Goal$/i }));

  // Interact with the modal
  fireEvent.change(screen.getByLabelText(/Exercise/i), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText(/Target Value/i), { target: { value: '10' } });
  fireEvent.change(screen.getByLabelText(/Deadline/i), { target: { value: '2024-12-31' } });

  fireEvent.click(screen.getByRole('button', { name: /Add Goal/i }));
  expect(await screen.findByText(/Sit-ups/i)).toBeInTheDocument();
});

test('can add a new log', async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Workout Logs/i));
  fireEvent.click(screen.getByRole('button', { name: /^Log Workout$/i }));

  fireEvent.change(screen.getByLabelText(/Exercise/i), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2023-12-25' } });
  fireEvent.change(screen.getByLabelText(/Value/i), { target: { value: '25' } });

  fireEvent.click(screen.getByRole('button', { name: /Save Log/i }));

  expect(await screen.findByText(/25/i)).toBeInTheDocument();
});
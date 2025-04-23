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

// Mock the unique ID generator
jest.mock('../src/App', () => {
  const originalModule = jest.requireActual('../src/App');
  return {
    __esModule: true,
    ...originalModule,
    default: originalModule.default,
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders the component after loading', async () => {
      render(<App />);

      // Wait for loading to finish. Adjust timeout if needed.
      await waitFor(() => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 2000 });

      // Check if the heading is rendered
      expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
  });

  test('adds a new student', async () => {
    render(<App />);

    await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 2000 });

    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Grade/i), { target: { value: '1st' } });
    fireEvent.change(screen.getByLabelText(/Subjects/i), { target: { value: 'Math, Science' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));

    await waitFor(() => {
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('filters students by search term', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 2000 });

    const searchInput = screen.getByPlaceholderText(/Search students/i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    expect(screen.getByText(/Alice Wonderland/i)).toBeInTheDocument();
    expect(screen.queryByText(/Bob The Builder/i)).not.toBeInTheDocument();
  });

  test('filters students by grade', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 2000 });

    fireEvent.change(screen.getByLabelText(/Filter students by grade/i), { target: { value: '3rd' } });

    expect(screen.getByText(/Bob The Builder/i)).toBeInTheDocument();
    expect(screen.queryByText(/Alice Wonderland/i)).not.toBeInTheDocument();
  });
});
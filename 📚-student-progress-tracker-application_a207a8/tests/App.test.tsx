import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
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

// Mock the window.confirm function
global.confirm = jest.fn(() => true);

// Helper function to add a student
const addStudent = async (name: string, goals: string) => {
  fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
  fireEvent.change(screen.getByLabelText(/Student Name/i), { target: { value: name } });
  fireEvent.change(screen.getByLabelText(/Goals\/Targets/i), { target: { value: goals } });
  fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
  await waitFor(() => screen.getByRole('button', { name: /Add Student/i }));
};

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText(/Loading Student Data.../i)).toBeInTheDocument();
  });

  test('renders initial students from localStorage or initial data', async () => {
    render(<App />);
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading Student Data.../i)).toBeNull();
    });
    expect(screen.getByText(/Alice Wonderland/i)).toBeInTheDocument();
    expect(screen.getByText(/Bob The Builder/i)).toBeInTheDocument();
  });

  test('can add a new student', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading Student Data.../i)).toBeNull();
    });

    await addStudent('Charlie Chaplin', 'Be a funny student');

    expect(screen.getByText(/Charlie Chaplin/i)).toBeInTheDocument();
  });

  test('can delete a student', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading Student Data.../i)).toBeNull();
    });

    // Add a student to delete
    await addStudent('ToDelete', 'ToDeleteGoals');

    //Open the student for viewing
    fireEvent.click(screen.getByRole('button', { name: /ToDelete/ }));

    //Delete the student
    fireEvent.click(screen.getByRole('button', { name: /Delete Student/ }));

    //Wait for confirmation
    expect(global.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText(/ToDelete/i)).toBeNull();
    });
  });

  test('can toggle dark mode', async () => {
      render(<App />);

       // Wait for loading to finish
      await waitFor(() => {
          expect(screen.queryByText(/Loading Student Data.../i)).toBeNull();
      });

      const themeToggle = screen.getByRole('switch', {name: /theme-toggle/i});

      // Check initial state
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // Toggle dark mode
      fireEvent.click(themeToggle);

      // Check if dark mode is applied
      await waitFor(() => {
           expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
  });

  test('displays error message when localStorage fails to load', () => {
    // Mock localStorage to throw an error
    const localStorageMockError = {
        getItem: jest.fn(() => {
            throw new Error('Failed to load from localStorage');
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
        value: localStorageMockError,
        writable: true // Allow redefining
    });

    render(<App />);
    expect(screen.findByText(/Failed to load student data/)).toBeTruthy()
  });
});

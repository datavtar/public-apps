import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders login and register forms when not authenticated', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });
  });

  test('allows navigation between login and register forms', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });
  });

  test('displays error message if login fails', async () => {
      render(<App />);

      await waitFor(() => {
          expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });

      userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
      userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
      userEvent.click(screen.getByRole('button', { name: /login/i }));

      // Mock localStorage to return no user
      localStorage.setItem('users', JSON.stringify([]));


      // Give time for the login attempt to complete
      await waitFor(() => {
          expect(screen.getByText(/user not found/i)).toBeInTheDocument();
      }, { timeout: 2000 }); // Adjust timeout if needed
  });

  test('registers a new user successfully', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    userEvent.click(screen.getByRole('button', { name: /register/i }));

    // Wait for the registration to complete and dashboard to render
    await waitFor(() => {
      expect(screen.getByText(/welcome back, test user!/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
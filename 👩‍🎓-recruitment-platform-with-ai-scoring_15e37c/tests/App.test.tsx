import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the AuthContext
const mockAuthContextValue = {
  currentUser: {
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
  },
  logout: jest.fn(),
};


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


beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});


describe('App Component', () => {
  it('renders the app with user signed in', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/recruitpro/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome, Test/i)).toBeInTheDocument();
  });

  it('renders the app without user signed in', () => {
    const mockAuthContextValueSignedOut = {
      currentUser: null,
      logout: jest.fn(),
    };
    render(
      <AuthContext.Provider value={mockAuthContextValueSignedOut}>
        <App />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Recruitment Platform/i)).toBeInTheDocument();
    expect(screen.getByText(/Please sign in to continue/i)).toBeInTheDocument();
  });

  it('navigates to jobs view when jobs link is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /jobs/i }));

    await waitFor(() => {
      expect(screen.getByText(/Job Postings/i)).toBeInTheDocument();
    });
  });

  it('allows creating a new job', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /jobs/i }));
    await waitFor(() => {
      expect(screen.getByText(/Job Postings/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Job/i }));

    fireEvent.change(screen.getByPlaceholderText(/e.g. Senior Software Engineer/i), { target: { value: 'Software Engineer' } });
    fireEvent.change(screen.getByPlaceholderText(/e.g. Tech Corp/i), { target: { value: 'Acme Corp' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Job/i }));

    await waitFor(() => {
      expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument();
      expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument();
    });
  });

  it('shows welcome page fallback', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByTestId('welcome_fallback')).toBeInTheDocument();
  });

  it('shows generation issue fallback', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByTestId('generation_issue_fallback')).toBeInTheDocument();
  });
});
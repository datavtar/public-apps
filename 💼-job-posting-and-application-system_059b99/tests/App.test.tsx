import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the AuthContext
const mockAuthContextValue = {
  currentUser: {
    id: 'user123',
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com'
  },
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
  resetPassword: jest.fn()
};

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

// Helper function to render the component with the mock context
const renderWithContext = (ui: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContextValue}>
      {ui}
    </AuthContext.Provider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders without crashing', () => {
    renderWithContext(<App />);
    expect(screen.getByText(/Welcome, Test!/i)).toBeInTheDocument();
  });

  test('role switcher recruiter button works', async () => {
    renderWithContext(<App />);

    const recruiterButton = screen.getByRole('button', { name: /recruiter/i });

    fireEvent.click(recruiterButton);

    await waitFor(() => {
      expect(localStorageMock.getItem('userRole')).toBe('recruiter');
    });
  });

  test('role switcher candidate button works', async () => {
    renderWithContext(<App />);

    const candidateButton = screen.getByRole('button', { name: /candidate/i });

    fireEvent.click(candidateButton);

    await waitFor(() => {
      expect(localStorageMock.getItem('userRole')).toBe('candidate');
    });
  });

  test('displays welcome message with user\'s first name', () => {
    renderWithContext(<App />);
    expect(screen.getByText(/Welcome, Test!/i)).toBeInTheDocument();
  });

  test('create job button is present in recruiter mode', async () => {
    renderWithContext(<App />);
    localStorageMock.setItem('userRole', 'recruiter');

    renderWithContext(<App />);

    expect(screen.getByRole('button', { name: /Post New Job/i })).toBeInTheDocument();
  });

  test('search jobs functionality', async () => {
    renderWithContext(<App />);

    const searchInput = screen.getByPlaceholderText(/Search jobs.../i);

    fireEvent.change(searchInput, { target: { value: 'Senior Frontend Developer' } });

    expect(searchInput).toBeInTheDocument();
  });

  test('logout button calls logout function from context', () => {
    renderWithContext(<App />);
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(mockAuthContextValue.logout).toHaveBeenCalledTimes(1);
  });

  test('navigates to jobs page when Jobs nav item is clicked', () => {
    renderWithContext(<App />);
    const jobsLink = screen.getByRole('button', {name: /jobs/i});
    fireEvent.click(jobsLink);

  });
});
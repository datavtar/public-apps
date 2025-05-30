import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';

// Mock the AuthContext
const mockAuthContextValue = {
  currentUser: {
    uid: 'test-uid',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User'
  },
  logout: jest.fn(),
  signup: jest.fn(),
  login: jest.fn(),
  passwordReset: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn()
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
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContextValue}>
        {ui}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('App Component', () => {

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    renderWithContext(<App />);
  });

  test('renders fallback loading state', async () => {
    renderWithContext(<App />);
    
    // Await the removal of the loading state
    await waitFor(() => expect(screen.queryByText('Copyright ©')).toBeInTheDocument(), {timeout: 3000});
  });

  test('renders the header with user info when logged in', async () => {
    renderWithContext(<App />);
    
    await waitFor(() => expect(screen.getByText('Hi, Test!')).toBeInTheDocument(), {timeout: 3000});
  });

  test('renders AI Helper button', async () => {
    renderWithContext(<App />);

    await waitFor(() => expect(screen.getByRole('button', {name: /AI Helper/i})).toBeInTheDocument(), {timeout: 3000});
  });

  test('renders Add Task Manually button', async () => {
    renderWithContext(<App />);

    await waitFor(() => expect(screen.getByRole('button', {name: /Add Task Manually/i})).toBeInTheDocument(), {timeout: 3000});
  });

  test('renders filter and sort section', async () => {
    renderWithContext(<App />);

    await waitFor(() => expect(screen.getByLabelText(/search tasks.../i)).toBeInTheDocument(), {timeout: 3000});
    await waitFor(() => expect(screen.getByLabelText(/status/i)).toBeInTheDocument(), {timeout: 3000});
    await waitFor(() => expect(screen.getByLabelText(/priority/i)).toBeInTheDocument(), {timeout: 3000});
  });
});
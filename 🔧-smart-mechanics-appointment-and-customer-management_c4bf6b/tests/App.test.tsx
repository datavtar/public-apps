import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';
import { AuthProvider } from '../src/contexts/authContext';

const mockCurrentUser = {
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'manager'
};

// Mock the useAuth hook
jest.mock('../src/contexts/authContext', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

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

beforeEach(() => {
  localStorageMock.clear();
});


test('renders AutoService Pro title', () => {
  render(
      <App />
  );
  const titleElement = screen.getByText(/AutoService Pro/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders Customer View by default', () => {
    render(
        <App />
    );
    expect(screen.getByText(/Customer View/i)).toBeInTheDocument();
});

test('renders Logout button', () => {
    render(
        <App />
    );
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
});

test('renders customer registration section', () => {
    render(
        <App />
    );
    expect(screen.getByText(/New Customer Registration/i)).toBeInTheDocument();
});

test('renders book appointment section', () => {
    render(
        <App />
    );
    expect(screen.getByText(/Book an Appointment/i)).toBeInTheDocument();
});

test('renders Our Services section', () => {
    render(
        <App />
    );
    expect(screen.getByText(/Our Services/i)).toBeInTheDocument();
});

test('renders Copyright information in the footer', () => {
  render(<App />);
  const footerText = screen.getByText(/Copyright © 2025 of Datavtar Private Limited/i);
  expect(footerText).toBeInTheDocument();
});


import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';
import { AuthProvider } from '../src/contexts/authContext';

// Mock the useAuth hook
jest.mock('../src/contexts/authContext', () => ({
  useAuth: () => ({
    currentUser: {
      uid: 'test-uid',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User'
    },
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</> // Mock AuthProvider
}));


describe('App Component', () => {
  test('renders the component', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );

    // Check for a heading to ensure the component renders
    expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
  });

  test('renders dashboard tab by default', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByText(/Total Students/i)).toBeInTheDocument();
  });

  test('renders AI Analysis button', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByRole('button', { name: /AI Analysis/i })).toBeInTheDocument();
  });


  test('renders logout button', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });
});
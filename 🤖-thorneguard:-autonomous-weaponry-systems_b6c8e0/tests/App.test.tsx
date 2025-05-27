import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';
import { AuthProvider } from '../src/contexts/authContext';

// Mock the authContext
jest.mock('../src/contexts/authContext', () => ({
  useAuth: () => ({
    currentUser: null,
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock the AILayer component
jest.mock('../src/components/AILayer', () => ({
  __esModule: true,
  default: () => <div data-testid="ai-layer-mock">AILayer Mock</div>,
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByText(/ThorneGuard/i)).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByRole('button', { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Products/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /About/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /News/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Contact/i })).toBeInTheDocument();
  });

  test('renders hero section content', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByText(/Autonomous Defense/i)).toBeInTheDocument();
    expect(screen.getByText(/Next-generation AI-powered weaponry systems/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explore Systems/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download Brochure/i })).toBeInTheDocument();
  });

  test('renders products section', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByText(/Advanced Defense Systems/i)).toBeInTheDocument();
  });

  test('renders about section', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByText(/Leading Defense Innovation/i)).toBeInTheDocument();
  });

  test('renders news section', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByText(/Latest Developments/i)).toBeInTheDocument();
  });

  test('renders contact section', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByText(/Connect With Our Team/i)).toBeInTheDocument();
  });

  test('renders the mocked AILayer component', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByTestId('ai-layer-mock')).toBeInTheDocument();
  });
});
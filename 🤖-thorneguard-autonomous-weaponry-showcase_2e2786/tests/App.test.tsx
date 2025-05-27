import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the auth context
const mockAuthContextValue = {
  currentUser: null,
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
  resetPassword: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn()
};

const renderWithAuthProvider = (ui: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContextValue}>
      {ui}
    </AuthContext.Provider>
  );
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

// Mock the AILayer component
jest.mock('../src/components/AILayer', () => {
  const MockAILayer = () => <div data-testid="ai-layer-mock">Mock AILayer</div>;
  return MockAILayer;
});


// Mock the placeholder API
jest.mock('../src/App', () => {
  const originalModule = jest.requireActual('../src/App');
  return {
    __esModule: true,
    ...originalModule,
    default: originalModule.default // Preserve the default export
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders learn react link', () => {
    renderWithAuthProvider(<App />);
    const linkElement = screen.getByText(/ThorneGuard/i);
    expect(linkElement).toBeInTheDocument();
  });
  
  test('navigates to products section when Explore Products button is clicked', async () => {
    renderWithAuthProvider(<App />);
    const exploreProductsButton = screen.getByRole('button', { name: /Explore Products/i });
    fireEvent.click(exploreProductsButton);

    await waitFor(() => {
      expect(screen.getByText(/Defense Solutions/i)).toBeInTheDocument();
    });
  });

  test('displays product name', async () => {
    renderWithAuthProvider(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Explore Products/i }));
    await waitFor(() => {
        expect(screen.getByText(/TG-AS100 Autonomous Sentry/i)).toBeInTheDocument();
    });
  });

  test('Checks Ai Analysis navigation', async () => {
    renderWithAuthProvider(<App />);
    const aiAnalysisNav = screen.getByRole('button', { name: /AI Analysis/i });
    fireEvent.click(aiAnalysisNav);
    await waitFor(() => {
        expect(screen.getByText(/AI Document Analysis/i)).toBeInTheDocument();
    });
  });
});
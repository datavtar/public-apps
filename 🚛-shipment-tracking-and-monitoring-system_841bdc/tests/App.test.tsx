import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthProvider, useAuth } from '../src/contexts/authContext';

// Mock the auth context
const mockAuth = {
  currentUser: {
    uid: 'test-user-uid',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User'
  },
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  resetPassword: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn()
};

jest.mock('../src/contexts/authContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  },
  useAuth: () => mockAuth
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


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByText(/ShipTracker Pro/i)).toBeInTheDocument();
  });

  test('displays initial dashboard', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByText(/Total Shipments/i)).toBeInTheDocument();
  });

  test('displays shipments tab when clicked', async () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    fireEvent.click(screen.getByText(/Shipments/i));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search shipments.../i)).toBeInTheDocument();
    });
  });

  test('displays settings tab when clicked', async () => {
      render(
          <AuthProvider>
              <App />
          </AuthProvider>
      );

      fireEvent.click(screen.getByText(/Settings/i))

      await waitFor(() => {
          expect(screen.getByText(/Currency/i)).toBeInTheDocument()
      })
  })

  test('add shipment functionality', async () => {
    render(
        <AuthProvider>
            <App/>
        </AuthProvider>
    )

    fireEvent.click(screen.getByText(/Shipments/i))

    await waitFor(() => {
        expect(screen.getByRole('button', {name: /^Add$/i})).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', {name: /^Add$/i}))

    await waitFor(() => {
        expect(screen.getByText(/Tracking Number/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Tracking Number/i), {target: {value: 'TEST1234'}})
    fireEvent.change(screen.getByLabelText(/Customer Name/i), {target: {value: 'Test Customer'}})
    fireEvent.change(screen.getByLabelText(/Origin/i), {target: {value: 'Test Origin'}})
    fireEvent.change(screen.getByLabelText(/Destination/i), {target: {value: 'Test Destination'}})

    fireEvent.click(screen.getByRole('button', {name: /Create Shipment/i}))


    await waitFor(() => {
        expect(screen.getByText('TEST1234')).toBeInTheDocument()
    })

  })
});

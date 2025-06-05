import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the auth context
const mockAuthContextValue = {
  currentUser: {
    uid: 'test-user-uid',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'manager'
  },
  logout: jest.fn()
};


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


// Mock the AILayer component
jest.mock('../src/components/AILayer', () => {
  return {
    __esModule: true,
    default: React.forwardRef((props, ref) => (
      <div data-testid="ai-layer">Mock AILayer</div>
    )),
  };
});

// Mock the react-camera-pro component
jest.mock('react-camera-pro', () => {
  return {
    __esModule: true,
    Camera: jest.fn(() => <div data-testid="camera">Mock Camera</div>),
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders learn react link', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByText(/AutoService Pro/i)).toBeInTheDocument();
  });

  test('renders the component in customer view by default', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByText(/Easy Scheduling/i)).toBeInTheDocument();
  });

  test('switches to manager view when manager view button is clicked', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    const managerViewButton = screen.getByRole('button', { name: /Manager View/i });
    fireEvent.click(managerViewButton);

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });


  test('opens QR scanner modal and displays camera view when QR Scanner button is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    // Switch to manager view first
    const managerViewButton = screen.getByRole('button', { name: /Manager View/i });
    fireEvent.click(managerViewButton);

    const qrScannerButton = screen.getByRole('button', { name: /QR Scanner/i });
    fireEvent.click(qrScannerButton);

    // Wait for the camera component to be rendered.  Added delay since camera component render is asynch.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.getByTestId('camera')).toBeInTheDocument();
  });

  test('displays camera access denied message when camera permissions are denied', async () => {
    // Mock the getUserMedia function to reject the promise
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn(() => Promise.reject(new Error('Permission denied'))),
      },
      writable: true,
    });

    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    // Switch to manager view first
    const managerViewButton = screen.getByRole('button', { name: /Manager View/i });
    fireEvent.click(managerViewButton);

    const qrScannerButton = screen.getByRole('button', { name: /QR Scanner/i });
    fireEvent.click(qrScannerButton);

    // Wait for the camera access to be denied and error message displayed
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.getByText(/Camera Access Denied/i)).toBeInTheDocument();
  });
});

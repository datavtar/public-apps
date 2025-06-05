import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'
import { AuthContext } from '../src/contexts/authContext';

// Mock the auth context
const mockAuthContextValue = {
  currentUser: {
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User'
  },
  logout: jest.fn(),
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

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

describe('App Component', () => {
  test('renders basic layout', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    expect(screen.getByText('TMS Pro')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('renders dashboard content', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Total Vehicles')).toBeInTheDocument();
    expect(screen.getByText('Total Drivers')).toBeInTheDocument();
    expect(screen.getByText('Active Schedules')).toBeInTheDocument();
    expect(screen.getByText('Pending Shipments')).toBeInTheDocument();
  });

  test('renders Vehicles page when Vehicles link is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText('Vehicles'));
    await waitFor(() => {
        expect(screen.getByText('Vehicles')).toBeInTheDocument();
    });
  });

  test('renders Drivers page when Drivers link is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText('Drivers'));
     await waitFor(() => {
        expect(screen.getByText('Drivers')).toBeInTheDocument();
    });
  });

  test('renders Routes page when Routes link is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText('Routes'));
    await waitFor(() => {
        expect(screen.getByText('Routes')).toBeInTheDocument();
    });
  });

  test('renders Schedules page when Schedules link is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText('Schedules'));
    await waitFor(() => {
        expect(screen.getByText('Schedules')).toBeInTheDocument();
    });
  });

  test('renders Shipments page when Shipments link is clicked', async () => {
     render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText('Shipments'));
    await waitFor(() => {
        expect(screen.getByText('Shipments')).toBeInTheDocument();
    });
  });

  test('renders AITools page when AITools link is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText('AITools'));
    await waitFor(() => {
        expect(screen.getByText('AI Powered Tools')).toBeInTheDocument();
    });
  });

  test('renders Settings page when Settings link is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText('Settings'));
    await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  test('logout button calls logout function from auth context', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText('Logout'));
    expect(mockAuthContextValue.logout).toHaveBeenCalled();
  });

  test('toggle theme button toggles theme', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    const themeToggle = screen.getByRole('button', { name: /Toggle theme/i });
    fireEvent.click(themeToggle);
  });

  test('displays no data message when there are no vehicles', async () => {
    localStorageMock.setItem('tms_vehicles', JSON.stringify([]));

    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    fireEvent.click(screen.getByText('Vehicles'));
    await waitFor(() => {
       expect(screen.getByText('No vehicles found.')).toBeInTheDocument();
    });
  });

  test('displays no data message when there are no drivers', async () => {
     localStorageMock.setItem('tms_drivers', JSON.stringify([]));
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    fireEvent.click(screen.getByText('Drivers'));
     await waitFor(() => {
        expect(screen.getByText('No drivers found.')).toBeInTheDocument();
    });
  });
});
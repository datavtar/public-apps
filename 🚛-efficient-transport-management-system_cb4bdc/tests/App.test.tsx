import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

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

// Mock the window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


d describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
  });

  it('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading Transport Management System...')).toBeInTheDocument();
  });

  it('renders the dashboard after loading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Transport Management System/i)).toBeInTheDocument();
    });
  });

  it('switches to vehicles tab when vehicles button is clicked', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Transport Management System/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Vehicles/i }));

    await waitFor(() => {
      expect(screen.getByText(/Vehicles Management/i)).toBeInTheDocument();
    });
  });

  it('opens the add vehicle modal when add vehicle button is clicked', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Transport Management System/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Vehicles/i }));

    await waitFor(() => {
      expect(screen.getByText(/Vehicles Management/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Add Vehicle/i }));

    await waitFor(() => {
      expect(screen.getByText(/Add New Vehicle/i)).toBeInTheDocument();
    });
  });

  it('closes the modal when cancel button is clicked', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Transport Management System/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Vehicles/i }));

    await waitFor(() => {
      expect(screen.getByText(/Vehicles Management/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Add Vehicle/i }));

    await waitFor(() => {
      expect(screen.getByText(/Add New Vehicle/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Add New Vehicle/i)).not.toBeInTheDocument();
    });
  });

  it('adds a vehicle successfully', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Transport Management System/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Vehicles/i }));

    await waitFor(() => {
      expect(screen.getByText(/Vehicles Management/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Add Vehicle/i }));

    await waitFor(() => {
      expect(screen.getByText(/Add New Vehicle/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Registration Number/i), { target: { value: 'TEST-123' } });
    fireEvent.change(screen.getByLabelText(/Model/i), { target: { value: 'Test Model' } });
    fireEvent.change(screen.getByLabelText(/Capacity \(kg\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Purchase Date/i), { target: { value: '2023-01-01' } });
    fireEvent.change(screen.getByLabelText(/Last Maintenance Date/i), { target: { value: '2024-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Vehicle/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Add New Vehicle/i)).not.toBeInTheDocument();
      expect(screen.getByText(/TEST-123/i)).toBeInTheDocument();
    });
  });
});

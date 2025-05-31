import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../src/App';


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

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<App />);
  });

  it('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading shipment data...')).toBeInTheDocument();
  });

  it('displays the dashboard after loading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText('Loading shipment data...')).not.toBeInTheDocument();
    });
    expect(screen.getByText('ShipTracker Pro')).toBeInTheDocument();
  });

  it('displays total shipments stat', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText('Loading shipment data...')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Total Shipments')).toBeInTheDocument();
  });

 it('can switch to shipments view', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText('Loading shipment data...')).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Shipments' }));
    expect(screen.getByPlaceholderText('Search shipments...')).toBeInTheDocument();
  });

  it('can add a shipment', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText('Loading shipment data...')).not.toBeInTheDocument();
    });

    // Navigate to shipments view
    fireEvent.click(screen.getByRole('button', { name: 'Shipments' }));

    // Open the modal to add a new shipment
    fireEvent.click(screen.getByRole('button', { name: /^Add Shipment$/i }));

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Tracking Number'), { target: { value: 'NEWTRACKING123' } });
    fireEvent.change(screen.getByLabelText('Origin'), { target: { value: 'New York' } });
    fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Los Angeles' } });
    fireEvent.change(screen.getByLabelText('Customer Name'), { target: { value: 'New Customer' } });
    fireEvent.change(screen.getByLabelText('Customer Email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText('Customer Phone'), { target: { value: '123-456-7890' } });
    fireEvent.change(screen.getByLabelText('Weight (lbs)'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Value ($)'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Estimated Delivery'), { target: { value: '2024-12-31' } });
    fireEvent.change(screen.getByLabelText('Carrier'), { target: { value: 'FedEx' } });


    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Shipment' }));

    // Wait for the modal to close and the new shipment to appear
    await waitFor(() => {
      expect(screen.getByText('NEWTRACKING123')).toBeInTheDocument();
    });
  });

});
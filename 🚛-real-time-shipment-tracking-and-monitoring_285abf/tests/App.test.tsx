import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    clear(): void {
      store = {};
    },
    removeItem(key: string): void {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the global matchMedia function
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



test('renders the component', () => {
  render(<App />);
  expect(screen.getByText(/ShipTracker Pro/i)).toBeInTheDocument();
});

test('displays loading state initially', () => {
  render(<App />);
  expect(screen.getByText(/Loading shipments/i)).toBeInTheDocument();
});

test('renders shipment data after loading', async () => {
    render(<App />);

    // Wait for loading state to disappear. Adjust timeout if necessary
    await waitFor(() => {
        expect(screen.queryByText(/Loading shipments/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Check if some shipment data is rendered
    expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
});


test('add a new shipment', async () => {
  render(<App />);

  // Wait for loading state to disappear
  await waitFor(() => {
      expect(screen.queryByText(/Loading shipments/i)).not.toBeInTheDocument();
  }, { timeout: 3000 });

  // Switch to shipments view
  fireEvent.click(screen.getByText(/Shipments/i));

  // Open the form
  fireEvent.click(screen.getByRole('button', { name: /Add Shipment/i }));

  // Fill out the form
  userEvent.type(screen.getByLabelText(/Tracking Number/i), 'TRK001234572');
  userEvent.type(screen.getByLabelText(/Customer Name/i), 'Test Customer');
  userEvent.type(screen.getByLabelText(/Customer Email/i), 'test@example.com');
  userEvent.type(screen.getByLabelText(/Origin/i), 'Test Origin');
  userEvent.type(screen.getByLabelText(/Destination/i), 'Test Destination');
  userEvent.type(screen.getByLabelText(/Estimated Delivery/i), '2025-02-01');
  userEvent.type(screen.getByLabelText(/Weight \(lbs\) \*/i), '10');
  userEvent.type(screen.getByLabelText(/Cost \(\$ \)\*/i), '100');

  // Submit the form
  fireEvent.click(screen.getByRole('button', { name: /Create Shipment/i }));

  // Wait for the form to close and check if the new shipment is displayed
  await waitFor(() => {
      expect(screen.getByText(/Test Customer/i)).toBeInTheDocument();
  }, { timeout: 3000 });
});


test('search for a shipment', async () => {
  render(<App />);

  // Wait for loading state to disappear
  await waitFor(() => {
      expect(screen.queryByText(/Loading shipments/i)).not.toBeInTheDocument();
  }, { timeout: 3000 });

  // Switch to shipments view
  fireEvent.click(screen.getByText(/Shipments/i));

  // Search for a shipment
  userEvent.type(screen.getByPlaceholderText(/Search by tracking number, customer, or location.../i), 'John Smith');

  // Check if the shipment is displayed
  await waitFor(() => {
      expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
  }, { timeout: 3000 });
});

test('can filter shipments by status', async () => {
    render(<App />);

    // Wait for loading state to disappear
    await waitFor(() => {
        expect(screen.queryByText(/Loading shipments/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Navigate to the shipments view.
    fireEvent.click(screen.getByText('Shipments'));

    // Filter by "delivered" status.
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'delivered' } });

    // Wait for the filter to apply and check if the delivered shipment is displayed.
    await waitFor(() => {
        // Check for Sarah Johnson, which is delivered
        expect(screen.getByText(/Sarah Johnson/)).toBeInTheDocument();

        // Ensure that John Smith is NOT present after filtering.
        expect(screen.queryByText(/John Smith/)).not.toBeInTheDocument();
    }, { timeout: 3000 });
});



import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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


// Mock the alert function
global.alert = jest.fn();

// Mock the confirm function
global.confirm = jest.fn(() => true);


beforeEach(() => {
  // Clear localStorage before each test
  localStorageMock.clear();
  (global.alert as jest.Mock).mockClear();
  (global.confirm as jest.Mock).mockClear();
});

describe('App Component', () => {
  it('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/ShipTracker Pro/i)).toBeInTheDocument();
  });

  it('displays total shipments in dashboard view', () => {
    render(<App />);
    expect(screen.getByText(/Total Shipments/i)).toBeInTheDocument();
  });

  it('allows to switch to shipments list view', async () => {
    render(<App />);

    const shipmentsButton = screen.getByRole('button', { name: /Shipments/i });
    fireEvent.click(shipmentsButton);

    expect(screen.getByText(/Add Shipment/i)).toBeInTheDocument();
  });

  it('allows to add a new shipment', async () => {
    render(<App />);

    // Navigate to the list view first
    const shipmentsButton = screen.getByRole('button', { name: /Shipments/i });
    fireEvent.click(shipmentsButton);

    const addButton = screen.getByRole('button', { name: /Add Shipment/i });
    fireEvent.click(addButton);

    const trackingNumberInput = screen.getByLabelText(/Tracking Number/i);
    const customerNameInput = screen.getByLabelText(/Customer Name/i);
    const destinationInput = screen.getByLabelText(/Destination/i);

    fireEvent.change(trackingNumberInput, { target: { value: 'TEST1234' } });
    fireEvent.change(customerNameInput, { target: { value: 'Test Customer' } });
    fireEvent.change(destinationInput, { target: { value: 'Test Destination' } });

    const addShipmentButton = screen.getByRole('button', { name: /Add Shipment/i });
    fireEvent.click(addShipmentButton);

    expect((global.alert as jest.Mock).mock.calls.length).toBe(0);

    // Verify that the new shipment is displayed
    expect(screen.getByText(/TEST1234/i)).toBeInTheDocument();
  });

  it('shows alert if required fields are missing on add', async () => {
    render(<App />);

    // Navigate to the list view first
    const shipmentsButton = screen.getByRole('button', { name: /Shipments/i });
    fireEvent.click(shipmentsButton);

    const addButton = screen.getByRole('button', { name: /Add Shipment/i });
    fireEvent.click(addButton);

    const addShipmentButton = screen.getByRole('button', { name: /Add Shipment/i });
    fireEvent.click(addShipmentButton);

    expect((global.alert as jest.Mock).mock.calls.length).toBe(1);
  });

  it('allows to delete a shipment', async () => {
    render(<App />);

     // Navigate to the list view first
    const shipmentsButton = screen.getByRole('button', { name: /Shipments/i });
    fireEvent.click(shipmentsButton);

    const deleteButton = screen.getAllByRole('button', { name: /Delete/i })[0];
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
  });
});

import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

// Mock matchMedia
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
  }))
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Shipment Tracker/i)).toBeInTheDocument();
  });

  it('switches to dark mode when the toggle is clicked', () => {
    render(<App />);
    const themeToggle = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(themeToggle);
    expect(localStorageMock.getItem('darkMode')).toBe('true');
  });

  it('opens the add shipment modal when the add shipment button is clicked', async () => {
    render(<App />);
    const addShipmentButton = screen.getByRole('button', { name: /Add Shipment/i });
    fireEvent.click(addShipmentButton);

    expect(screen.getByText(/Add New Shipment/i)).toBeVisible();
  });

  it('allows filtering shipments by status', async () => {
    render(<App />);
    const filterButton = screen.getByRole('button', { name: /Filter/i });
    fireEvent.click(filterButton);

    const statusFilter = screen.getByLabelText(/Status/i);
    fireEvent.change(statusFilter, { target: { value: 'delivered' } });

    const applyButton = screen.getByRole('button', { name: /Apply/i });
    fireEvent.click(applyButton);
  });

 it('allows to add a new shipment', async () => {
    render(<App />);

    const addShipmentButton = screen.getByRole('button', { name: /Add Shipment/i });
    fireEvent.click(addShipmentButton);

    const customerInput = screen.getByLabelText(/Customer/i);
    fireEvent.change(customerInput, { target: { value: 'Test Customer' } });

    const originInput = screen.getByLabelText(/Origin/i);
    fireEvent.change(originInput, { target: { value: 'Test Origin' } });

    const destinationInput = screen.getByLabelText(/Destination/i);
    fireEvent.change(destinationInput, { target: { value: 'Test Destination' } });

    const addFinalShipmentButton = screen.getByRole('button', { name: /Add Shipment/i,});
    fireEvent.click(addFinalShipmentButton);

  });

});

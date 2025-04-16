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

// Mock window.confirm
const originalConfirm = window.confirm;

beforeEach(() => {
  window.confirm = jest.fn(() => true); // Always return true for confirm
  localStorage.clear(); // Clear localStorage before each test
});

afterEach(() => {
  window.confirm = originalConfirm; // Restore original confirm
});


describe('App Component', () => {
  test('renders LogiTrack title', () => {
    render(<App />);
    expect(screen.getByText(/LogiTrack/i)).toBeInTheDocument();
  });

  test('renders the Shipment Dashboard heading', () => {
    render(<App />);
    expect(screen.getByText(/Shipment Dashboard/i)).toBeInTheDocument();
  });

  test('opens and closes the add shipment modal', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add Shipment/i });

    fireEvent.click(addButton);

    expect(screen.getByText(/Add New Shipment/i)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /Close modal/i });
    if (closeButton) {
      fireEvent.click(closeButton);
    }
  });

    test('deletes a shipment', async () => {
      render(<App />);

      // Wait for the shipments to load
      await screen.findByText('TRK123456789');
  
      // Find the delete button for the first shipment
      const deleteButton = screen.getAllByRole('button', { name: /Delete shipment/i })[0];

      // Click the delete button
      fireEvent.click(deleteButton);

      // Assert that the confirm function was called
      expect(window.confirm).toHaveBeenCalled();

      // Give time for the state to update (you might need to adjust the timeout)
      await new Promise((resolve) => setTimeout(resolve, 50));
  
    });

  test('filters shipments by status', async () => {
    render(<App />);
    const filterButton = screen.getByRole('button', { name: /Filters/i });
    fireEvent.click(filterButton);

    const statusFilter = screen.getByLabelText(/Status/i) as HTMLSelectElement;
    fireEvent.change(statusFilter, { target: { value: 'Delivered' } });
    
    // Wait for the filtered shipments to render
    await screen.findByText('Delivered');

    // Check if only 'Delivered' shipments are displayed, might require more robust checks
    const deliveredShipment = screen.getByText('Delivered');
    expect(deliveredShipment).toBeInTheDocument();
  });

  test('resets the filters', async () => {
    render(<App />);

    // Open the filter
    const filterButton = screen.getByRole('button', { name: /Filters/i });
    fireEvent.click(filterButton);

    // Select a status
    const statusFilter = screen.getByLabelText(/Status/i) as HTMLSelectElement;
    fireEvent.change(statusFilter, { target: { value: 'Delivered' } });

    // Reset the filters
    const resetButton = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetButton);

  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('true');

    const lightModeButton = screen.getByRole('button', { name: /Switch to light mode/i });
    if (lightModeButton) {
      fireEvent.click(lightModeButton);
    }
    expect(localStorage.getItem('darkMode')).toBe('false');
  });
});

import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


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
  localStorageMock.setItem('shipments', JSON.stringify([
    {
      id: '1',
      trackingNumber: 'TRK-123',
      origin: 'New York',
      destination: 'Los Angeles',
      customer: 'Test Customer',
      status: 'in_transit',
      departureDate: '2023-10-26',
      estimatedArrival: '2023-10-27',
      actualArrival: null,
      weight: 100,
      description: 'Test shipment',
      currentLocation: 'Chicago',
      carrier: 'Test Carrier',
      cost: 50,
      lastUpdated: '2023-10-26T12:00:00.000Z'
    }
  ]));
});

test('renders the component', () => {
  render(<App />);
  expect(screen.getByText(/Shipment Tracker/i)).toBeInTheDocument();
});

test('displays shipments from localStorage', () => {
  render(<App />);
  expect(screen.getByText('TRK-123')).toBeInTheDocument();
});

test('opens and closes the new shipment modal', () => {
  render(<App />);
  const addButton = screen.getByRole('button', { name: /New Shipment/i });
  fireEvent.click(addButton);
  expect(screen.getByText(/Add New Shipment/i)).toBeInTheDocument();

  const closeButton = screen.getByLabelText(/Close modal/i);
  fireEvent.click(closeButton);
  expect(screen.queryByText(/Add New Shipment/i)).not.toBeInTheDocument();
});

test('opens and closes the filter modal', () => {
  render(<App />);
  const filterButton = screen.getByRole('button', { name: /Filter/i });
  fireEvent.click(filterButton);
  expect(screen.getByText(/Filter Shipments/i)).toBeInTheDocument();

  const closeButton = screen.getByLabelText(/Close modal/i);
  fireEvent.click(closeButton);
  expect(screen.queryByText(/Filter Shipments/i)).not.toBeInTheDocument();
});

test('opens and closes the import/export modal', () => {
  render(<App />);
  const importExportButton = screen.getByRole('button', { name: /Import\/Export/i });
  fireEvent.click(importExportButton);
  expect(screen.getByText(/Import\/Export Data/i)).toBeInTheDocument();

  const closeButton = screen.getByLabelText(/Close modal/i);
  fireEvent.click(closeButton);
  expect(screen.queryByText(/Import\/Export Data/i)).not.toBeInTheDocument();
});

test('opens and closes the reports modal', () => {
  render(<App />);
  const reportsButton = screen.getByRole('button', { name: /Reports/i });
  fireEvent.click(reportsButton);
  expect(screen.getByText(/Shipment Reports/i)).toBeInTheDocument();

  const closeButton = screen.getByRole('button', { name: /Close/i });
  fireEvent.click(closeButton);
  expect(screen.queryByText(/Shipment Reports/i)).not.toBeInTheDocument();
});

test('filters shipments based on search term', async () => {
  render(<App />);
  const searchInput = screen.getByPlaceholderText(/Search shipments.../i);
  fireEvent.change(searchInput, { target: { value: 'TRK-123' } });

  expect(screen.getByText('TRK-123')).toBeInTheDocument();
});

test('toggles dark mode', () => {
  render(<App />);
  const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i});
  fireEvent.click(darkModeButton);
  expect(localStorage.getItem('darkMode')).toBe('true');
});
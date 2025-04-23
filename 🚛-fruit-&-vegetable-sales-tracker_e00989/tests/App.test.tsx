import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

// Mock initial localStorage data
const mockSalesData = [
  {
    id: '1',
    name: 'કેરી',
    type: 'ફળ',
    quantity: 5,
    pricePerUnit: 100,
    date: '2024-05-15',
    season: 'ઉનાળો',
  },
];

beforeEach(() => {
  localStorage.clear();
});

test('renders the app title', async () => {
  localStorage.setItem('fruitVendorSales', JSON.stringify(mockSalesData));
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText('ફળ અને શાકભાજી વેચાણ ટ્રેકર')).toBeInTheDocument();
  });
});

test('renders loading state initially', () => {
  render(<App />);
  expect(screen.getByText('લોડ કરી રહ્યું છે...')).toBeInTheDocument();
});

test('renders no sales message when there are no sales data', async () => {
  localStorage.setItem('fruitVendorSales', JSON.stringify([]));
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText('હજુ સુધી કોઈ વેચાણ નોંધાયેલ નથી.')).toBeInTheDocument();
  });
});

test('renders error message when loading fails', async () => {
  jest.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
    throw new Error('Failed to load data');
  });

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/ભૂલ: ડેટા લોડ કરવામાં નિષ્ફળ./i)).toBeInTheDocument();
  });

  jest.restoreAllMocks();
});

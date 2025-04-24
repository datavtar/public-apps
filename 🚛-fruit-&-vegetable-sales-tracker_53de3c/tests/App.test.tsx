import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
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
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('લોડ કરી રહ્યું છે...')).toBeInTheDocument();
  });

  test('renders error state when data loading fails', async () => {
    localStorageMock.getItem = jest.fn().mockImplementation(() => {
      throw new Error('Failed to load data');
    });

    render(<App />);

    // Wait for the component to attempt loading and then display the error
    await waitFor(() => {
      expect(screen.getByText('ભૂલ: ડેટા લોડ કરવામાં નિષ્ફળ.')).toBeInTheDocument();
    });
  });

  test('renders the app title', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('હાર્વેસ્ટ સેલ્સ')).toBeInTheDocument());
  });

  test('renders the add sale button', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByRole('button', { name: /નવું વેચાણ ઉમેરો/i })).toBeInTheDocument());
  });

  test('renders initial sales data from localStorage', async () => {
    const initialSalesData = [
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
    localStorageMock.setItem('harvestSales', JSON.stringify(initialSalesData));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('કેરી')).toBeInTheDocument();
    });
  });
});

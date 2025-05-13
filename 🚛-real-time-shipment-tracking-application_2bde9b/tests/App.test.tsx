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



// Mock the generateSampleData function to return an empty array initially
jest.mock('../src/App', () => {
  const originalModule = jest.requireActual('../src/App') as any;

  return {
    __esModule: true,
    ...originalModule,
    default: originalModule.default,
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders header', () => {
    render(<App />);
    expect(screen.getByText(/Shipment Tracker/i)).toBeInTheDocument();
  });

  test('renders loading state initially', () => {
    render(<App />);
    expect(screen.getByText(/Loading shipments.../i)).toBeInTheDocument();
  });

  test('renders shipment data after loading', async () => {
    render(<App />);

    // Wait for loading to finish (adjust timeout if needed)
    await waitFor(() => {
      expect(screen.queryByText(/Loading shipments.../i)).not.toBeInTheDocument();
    }, { timeout: 2000 });

    // Check if some shipment data is displayed
    expect(screen.getByText(/Total Shipments/i)).toBeInTheDocument();
  });

  test('add shipment button opens modal', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading shipments.../i)).not.toBeInTheDocument();
    }, { timeout: 2000 });

    const addButton = screen.getByRole('button', { name: /Add Shipment/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Add New Shipment/i)).toBeInTheDocument();
    });
  });

  test('import button exists', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading shipments.../i)).not.toBeInTheDocument();
    }, { timeout: 2000 });

    const importButton = screen.getByText(/Import/i);
    expect(importButton).toBeInTheDocument();
  });

    test('export button exists', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading shipments.../i)).not.toBeInTheDocument();
    }, { timeout: 2000 });

    const exportButton = screen.getByText(/Export/i);
    expect(exportButton).toBeInTheDocument();
  });

  test('template button exists', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading shipments.../i)).not.toBeInTheDocument();
    }, { timeout: 2000 });

    const templateButton = screen.getByText(/Template/i);
    expect(templateButton).toBeInTheDocument();
  });
});
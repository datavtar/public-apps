import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock the matchMedia function
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

  test('displays loading state initially', () => {
      render(<App />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders initial flower data after loading', async () => {
    render(<App />);
    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check if initial flowers are rendered (at least one)
    expect(screen.getByText('Rose')).toBeInTheDocument();
  });

    test('adds a new flower', async () => {
        render(<App />);

        // Wait for the loading state to disappear
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const addButton = screen.getByRole('button', { name: /^Add Flower$/i });
        fireEvent.click(addButton);

        const nameInput = screen.getByLabelText('Flower Name');
        const categoryInput = screen.getByLabelText('Category');
        const stockInput = screen.getByLabelText('Stock Quantity');
        const priceInput = screen.getByLabelText('Price (USD)');

        fireEvent.change(nameInput, { target: { value: 'New Flower' } });
        fireEvent.change(categoryInput, { target: { value: 'New Category' } });
        fireEvent.change(stockInput, { target: { value: '10' } });
        fireEvent.change(priceInput, { target: { value: '5.00' } });

        const saveButton = screen.getByRole('button', { name: /^Add Flower$/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('New Flower')).toBeInTheDocument();
        });
    });

    test('filters flowers by category', async () => {
      render(<App />);

        // Wait for the loading state to disappear
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const filterSelect = screen.getByLabelText('Filter by category');
        fireEvent.change(filterSelect, { target: { value: 'Classic' } });

        await waitFor(() => {
            expect(screen.getByText('Rose')).toBeInTheDocument();
            expect(screen.queryByText('Tulip')).not.toBeInTheDocument();
        });
    });

  test('deletes a flower', async () => {
    const { container } = render(<App />);

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Find the delete button for the 'Rose' flower
    const deleteButton = screen.getByRole('button', { name: /^Delete Rose$/i });

    // Mock window.confirm to return true (confirm deletion)
    const confirmMock = jest.spyOn(window, 'confirm').mockImplementation(() => true);

    // Click the delete button
    fireEvent.click(deleteButton);

    // Restore the original window.confirm function
    confirmMock.mockRestore();

    // Wait for the 'Rose' flower to be removed from the document
    await waitFor(() => {
      expect(screen.queryByText('Rose')).not.toBeInTheDocument();
    });
  });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock the AILayer component to prevent errors due to missing file
jest.mock('../src/components/AILayer', () => {
  return function MockAILayer() {
    return <div data-testid="ai-layer-mock">Mock AILayer</div>;
  };
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
    expect(screen.getByText('Loading invoices...')).toBeInTheDocument();
  });

  test('renders the AI-Powered Invoice Import section', () => {
    render(<App />);
    expect(screen.getByText('AI-Powered Invoice Import')).toBeInTheDocument();
  });

  test('renders the new invoice button', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /^New Invoice$/i });
    expect(addButton).toBeInTheDocument();
  });

  test('opens the modal when the new invoice button is clicked', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /^New Invoice$/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Invoice')).toBeInTheDocument();
    });
  });

  test('closes the modal when the cancel button is clicked', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /^New Invoice$/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Invoice')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Add New Invoice')).not.toBeInTheDocument();
    });
  });

  test('displays error message when failing to save to localStorage', async () => {
    const setItemSpy = jest.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('Failed to save to localStorage');
    });
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading invoices...')).not.toBeInTheDocument();
    });
    const addButton = screen.getByRole('button', { name: /^New Invoice$/i });
    fireEvent.click(addButton);

    await waitFor(() => {
        expect(screen.getByText('Add New Invoice')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText('Client Name'), {target: {value: 'test'}});
    fireEvent.click(screen.getByRole('button', {name: 'Save Invoice'}))
    await waitFor(() => {
        expect(screen.getByText('Could not save invoice data. Changes might not persist.')).toBeInTheDocument();
    });
    setItemSpy.mockRestore();

  });

  test('renders the search input', () => {
      render(<App />);
      const searchInput = screen.getByPlaceholderText('Search by Invoice #, Client...');
      expect(searchInput).toBeInTheDocument();
  });
});
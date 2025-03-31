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

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

beforeEach(() => {
  localStorageMock.clear();
});

test('renders Warehouse Management System title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Warehouse Management System/i);
  expect(titleElement).toBeInTheDocument();
});

test('initializes with dashboard tab active', () => {
  render(<App />);
  const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
  expect(dashboardButton).toHaveClass('bg-blue-50');
});

test('switches to inventory tab when clicked', async () => {
    render(<App />);
    const inventoryButton = screen.getByRole('button', { name: /inventory/i });
    fireEvent.click(inventoryButton);
    await waitFor(() => {
      expect(inventoryButton).toHaveClass('bg-blue-50');
    });
  });

test('adds a product', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /inventory/i }));
  fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));

  fireEvent.change(screen.getByLabelText(/SKU/i), { target: { value: 'TEST-SKU' } });
  fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Test Product' } });
  fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Test Category' } });
  fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '10' } });
  fireEvent.change(screen.getByLabelText(/Unit/i), { target: { value: 'pcs' } });
  fireEvent.change(screen.getByLabelText(/Unit Price/i), { target: { value: '25' } });
  fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Test Location' } });

  fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));

  await waitFor(() => {
    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
  });
});

test('deletes a product', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /inventory/i }));

  // Find the first delete button (assuming there's at least one product)
  const deleteButton = screen.getAllByRole('button', { name: /^Delete/i })[0];

  // Store the product name before deletion
  const row = deleteButton.closest('tr');
  const productName = row?.querySelector('td:nth-child(2)')?.textContent || '';

  // Mock the window.confirm function
  const mockConfirm = jest.spyOn(window, 'confirm');
  mockConfirm.mockImplementation(() => true);

  fireEvent.click(deleteButton);

  // Restore the original window.confirm function
  mockConfirm.mockRestore();

  await waitFor(() => {
    expect(screen.queryByText(productName)).not.toBeInTheDocument();
  });
});

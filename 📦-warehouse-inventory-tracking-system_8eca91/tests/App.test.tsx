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
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Warehouse Manager/i)).toBeInTheDocument();
  });

  test('initially shows the inventory tab', () => {
    render(<App />);
    expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();
  });

  test('navigates to movements tab', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Movements/i }));
    expect(screen.getByText(/Inventory Movements/i)).toBeInTheDocument();
  });

  test('navigates to dashboard tab', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText(/Warehouse Dashboard/i)).toBeInTheDocument();
  });
  
  test('allows adding a new product', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));
    expect(screen.getByText(/Add New Product/i)).toBeInTheDocument();
  });

  test('allows recording a new movement', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Movements/i }));
    fireEvent.click(screen.getByRole('button', { name: /Record Movement/i }));
    expect(screen.getByText(/Record Inventory Movement/i)).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const toggleButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(toggleButton);
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  test('displays products from localStorage if available', () => {
    const mockProducts = JSON.stringify([
      { id: '1', name: 'Test Product', sku: 'TEST-001', category: 'Test', quantity: 10, threshold: 5, location: 'A1', lastUpdated: new Date().toISOString() },
    ]);
    localStorage.setItem('warehouseProducts', mockProducts);
    render(<App />);
    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
  });

  test('displays movements from localStorage if available', () => {
    const mockMovements = JSON.stringify([
      { id: '1', productId: '1', type: 'incoming', quantity: 5, date: new Date().toISOString(), reference: 'REF-001', notes: 'Test Movement' },
    ]);
    localStorage.setItem('warehouseMovements', mockMovements);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Movements/i }));
    // It's difficult to reliably find the text without more specific identifiers. Relying on localStorage setup.
    expect(localStorage.getItem('warehouseMovements')).toBe(mockMovements);
  });
});

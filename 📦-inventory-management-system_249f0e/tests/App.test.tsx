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

// Mock the crypto.randomUUID function
global.crypto = {
  // @ts-ignore
  randomUUID: () => 'test-uuid',
} as Crypto;


// Mock the window.matchMedia
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
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<App />);
  });

  it('initializes with dark mode based on localStorage', () => {
    localStorage.setItem('darkMode', 'true');
    render(<App />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i});
    fireEvent.click(darkModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('darkMode')).toBe('true');

    const lightModeButton = screen.getByRole('button', {name: /Switch to light mode/i});
    fireEvent.click(lightModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });

  it('opens and closes the add item modal', async () => {
    render(<App />);
    const addItemButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addItemButton);
    expect(screen.getByText('Add New Item')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
  });

  it('adds a new item to the inventory', async () => {
    render(<App />);
    const addItemButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addItemButton);

    fireEvent.change(screen.getByLabelText(/Item Name/i), { target: { value: 'Test Item' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Test Category' } });
    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Low Stock Threshold/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Supplier/i), { target: { value: 'Test Supplier' } });

    const addItemSubmitButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addItemSubmitButton);

    // Wait for the notification to appear
    await screen.findByText('Item added successfully!');

    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('inventory') || '[]').length).toBe(1);
  });

  it('filters inventory items by name', async () => {
      render(<App />);

      // Add an item to the inventory for filtering
      const addItemButton = screen.getByRole('button', { name: /Add Item/i });
      fireEvent.click(addItemButton);

      fireEvent.change(screen.getByLabelText(/Item Name/i), { target: { value: 'Apple' } });
      fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Fruit' } });
      fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(/Low Stock Threshold/i), { target: { value: '5' } });
      fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Supplier/i), { target: { value: 'SupplierA' } });

      const addItemSubmitButton = screen.getByRole('button', { name: /Add Item/i });
      fireEvent.click(addItemSubmitButton);
      await screen.findByText('Item added successfully!');

      // Apply filter
      const searchInput = screen.getByPlaceholderText(/Search inventory.../i);
      fireEvent.change(searchInput, { target: { value: 'Apple' } });

      expect(screen.getByText('Apple')).toBeVisible();

      // Test No items found
      fireEvent.change(searchInput, { target: { value: 'NonExistentItem' } });
      expect(screen.getByText(/No items found/i)).toBeInTheDocument();
  });

  it('generates and triggers CSV download', () => {
    // Mock the link creation and click
    const mockCreateObjectURL = jest.fn();
    const mockClick = jest.fn();

    global.URL.createObjectURL = mockCreateObjectURL;
    const createElementSpy = jest.spyOn(document, 'createElement');
    createElementSpy.mockImplementation(() => ({
      setAttribute: jest.fn(),
      click: mockClick,
      style: {},
    } as any));

    render(<App />);
    const exportButton = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();

    createElementSpy.mockRestore(); // Restore the original implementation
  });

  it('switches between inventory and reports tabs', () => {
    render(<App />);

    const reportsTabButton = screen.getByRole('button', { name: /Reports/i });
    fireEvent.click(reportsTabButton);
    expect(screen.getByText(/Inventory Reports/i)).toBeInTheDocument();

    const inventoryTabButton = screen.getByRole('button', { name: /Inventory/i });
    fireEvent.click(inventoryTabButton);
    expect(screen.getByText(/Total Items/i)).toBeInTheDocument();
  });

});
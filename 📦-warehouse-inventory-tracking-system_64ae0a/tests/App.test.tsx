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

// Mock matchMedia
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


// Define types for mocks
type MockProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  location: string;
  lastUpdated: string;
};

type MockInventoryMovement = {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'transfer';
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  reason: string;
  date: string;
  performedBy: string;
};


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders the component without crashing', () => {
    render(<App />);
  });

  test('displays the dashboard view initially', () => {
    render(<App />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('navigates to inventory view when Inventory button is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inventory/i }));
    await waitFor(() => {
      expect(screen.getByText('Inventory')).toBeInTheDocument();
    });
  });

    test('adds a product correctly', async () => {
        render(<App />);

        // Navigate to add product form
        fireEvent.click(screen.getByRole('button', { name: /Inventory/i }));
        await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Add Product/i })));

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'New Product' } });
        fireEvent.change(screen.getByLabelText(/SKU/i), { target: { value: 'NEW-SKU' } });
        fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'New Category' } });
        fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '5' } });
        fireEvent.change(screen.getByLabelText(/Storage Location/i), { target: { value: 'New Location' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Save Product/i }));

        // Verify that the product is added and we're back on the inventory page
        await waitFor(() => expect(screen.getByText('Inventory')).toBeInTheDocument());
        expect(screen.getByText('New Product')).toBeInTheDocument();
    });


    test('deletes a product correctly', async () => {
        const initialProducts: MockProduct[] = [{
          id: '123',
          name: 'Test Product',
          sku: 'TEST-SKU',
          category: 'Test Category',
          quantity: 10,
          location: 'Test Location',
          lastUpdated: new Date().toISOString(),
        }];

        localStorageMock.setItem('warehouse-products', JSON.stringify(initialProducts));

        render(<App />);
        fireEvent.click(screen.getByRole('button', { name: /Inventory/i }));
        await waitFor(() => screen.getByText('Test Product'));
        // Mock the window.confirm function
        window.confirm = jest.fn(() => true);
        fireEvent.click(screen.getAllByRole('button', { name: /Delete product/i })[0]);

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this product?');
        await waitFor(() => expect(screen.queryByText('Test Product')).not.toBeInTheDocument());
    });


    test('filters products by name', async () => {
        const initialProducts: MockProduct[] = [
            { id: '1', name: 'Apple iPhone', sku: 'APPL-IPHN', category: 'Electronics', quantity: 5, location: 'A1', lastUpdated: new Date().toISOString() },
            { id: '2', name: 'Samsung Galaxy', sku: 'SMSNG-GLXY', category: 'Electronics', quantity: 10, location: 'A2', lastUpdated: new Date().toISOString() },
        ];
        localStorageMock.setItem('warehouse-products', JSON.stringify(initialProducts));
        render(<App />);
        fireEvent.click(screen.getByRole('button', { name: /Inventory/i }));

        const searchInput = screen.getByPlaceholderText(/Search by name or SKU.../i);
        fireEvent.change(searchInput, { target: { value: 'Apple' } });

        await waitFor(() => {
            expect(screen.getByText('Apple iPhone')).toBeInTheDocument();
            expect(screen.queryByText('Samsung Galaxy')).not.toBeInTheDocument();
        });
    });


    test('adds a movement correctly', async () => {
        const initialProducts: MockProduct[] = [{
          id: '1',
          name: 'Test Product',
          sku: 'TEST-SKU',
          category: 'Test Category',
          quantity: 10,
          location: 'Test Location',
          lastUpdated: new Date().toISOString(),
        }];
        localStorageMock.setItem('warehouse-products', JSON.stringify(initialProducts));

        render(<App />);

        // Navigate to add movement form
        fireEvent.click(screen.getByRole('button', { name: /Movements/i }));
        await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Record Movement/i })));

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/Product/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Movement Type/i), { target: { value: 'in' } });
        fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '5' } });
        fireEvent.change(screen.getByLabelText(/Reason \/ Reference/i), { target: { value: 'Initial Stock' } });
        fireEvent.change(screen.getByLabelText(/Performed By/i), { target: { value: 'John Doe' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Record Movement/i }));

        // Verify that the movement is added and we're back on the movements page
        await waitFor(() => expect(screen.getByText('Inventory Movements')).toBeInTheDocument());
    });


  test('sorts products by name in ascending order', async () => {
    const initialProducts: MockProduct[] = [
      { id: '1', name: 'Banana', sku: 'B123', category: 'Fruit', quantity: 10, location: 'A1', lastUpdated: new Date().toISOString() },
      { id: '2', name: 'Apple', sku: 'A456', category: 'Fruit', quantity: 5, location: 'A2', lastUpdated: new Date().toISOString() },
    ];
    localStorageMock.setItem('warehouse-products', JSON.stringify(initialProducts));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inventory/i }));

    // Initial order should be Banana, Apple
    expect((screen.getAllByRole('cell', {name: /Apple|Banana/i })[0])).toHaveTextContent('Banana');
    expect((screen.getAllByRole('cell', {name: /Apple|Banana/i })[1])).toHaveTextContent('Apple');

    // Click on the name header
    fireEvent.click(screen.getByText(/Name/i));

    // Sorted order should be Apple, Banana
    await waitFor(() => {
      expect((screen.getAllByRole('cell', {name: /Apple|Banana/i })[0])).toHaveTextContent('Apple');
      expect((screen.getAllByRole('cell', {name: /Apple|Banana/i })[1])).toHaveTextContent('Banana');
    });
  });


  test('toggles dark mode', async () => {
    render(<App />);

    // Initially, the body should not have the 'dark' class
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click the dark mode toggle button
    fireEvent.click(screen.getByRole('button', { name: /Toggle dark mode/i }));

    // Now, the body should have the 'dark' class
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Click the dark mode toggle button again
    fireEvent.click(screen.getByRole('button', { name: /Toggle dark mode/i }));

    // Now, the body should not have the 'dark' class
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('filters movements by type', async () => {
      const initialMovements: MockInventoryMovement[] = [
          { id: '1', productId: '1', type: 'in', quantity: 5, reason: 'Initial stock', date: new Date().toISOString(), performedBy: 'John' },
          { id: '2', productId: '2', type: 'out', quantity: 2, reason: 'Customer order', date: new Date().toISOString(), performedBy: 'Jane' },
      ];
      localStorageMock.setItem('warehouse-movements', JSON.stringify(initialMovements));

      const initialProducts: MockProduct[] = [
          { id: '1', name: 'Product A', sku: 'PROD-A', category: 'Category A', quantity: 10, location: 'Location A', lastUpdated: new Date().toISOString() },
          { id: '2', name: 'Product B', sku: 'PROD-B', category: 'Category B', quantity: 5, location: 'Location B', lastUpdated: new Date().toISOString() },
      ];
      localStorageMock.setItem('warehouse-products', JSON.stringify(initialProducts));

      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: /Movements/i }));

      const showFiltersButton = screen.getByRole('button', { name: /Show Filters/i });
      fireEvent.click(showFiltersButton);

      const movementTypeSelect = screen.getByLabelText(/Movement Type/i);
      fireEvent.change(movementTypeSelect, { target: { value: 'in' } });

      await waitFor(() => {
          expect(screen.getByText('Received')).toBeInTheDocument();
          expect(screen.queryByText('Issued')).not.toBeInTheDocument();
      });
  });
});
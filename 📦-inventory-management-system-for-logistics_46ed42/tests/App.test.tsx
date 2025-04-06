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
    }))
  });



describe('App Component', () => {

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Logistics Inventory Manager/i)).toBeInTheDocument();
  });

  it('renders dashboard tab by default', () => {
    render(<App />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('switches to inventory tab when inventory button is clicked', async () => {
    render(<App />);

    const inventoryButton = screen.getByRole('button', { name: /Inventory/i });
    fireEvent.click(inventoryButton);

    await waitFor(() => {
      expect(screen.getByText(/Inventory/i)).toBeVisible();
    });
  });

  it('displays the add item modal when Add Item button is clicked in inventory tab', async () => {
    render(<App />);
    const inventoryButton = screen.getByRole('button', { name: /Inventory/i });
    fireEvent.click(inventoryButton);

    const addItemButton = await screen.findByRole('button', { name: /Add Item/i });

    fireEvent.click(addItemButton);
    await waitFor(() => {
        expect(screen.getByText(/Add Inventory Item/i)).toBeVisible();
    });
  });


 it('downloads CSV template when Template button is clicked in inventory tab', async () => {
        const mockDownload = jest.fn();
        const originalCreateObjectURL = URL.createObjectURL;
        const originalAppendChild = document.body.appendChild;
        URL.createObjectURL = jest.fn(() => 'blobURL');
        document.body.appendChild = jest.fn();

        render(<App />);
        const inventoryButton = screen.getByRole('button', { name: /Inventory/i });
        fireEvent.click(inventoryButton);

        const templateButton = await screen.findByRole('button', { name: /Template/i });
        fireEvent.click(templateButton);

        await waitFor(() => {
                expect(URL.createObjectURL).toHaveBeenCalled();
           });

        URL.createObjectURL = originalCreateObjectURL;
        document.body.appendChild = originalAppendChild;
    });

  it('displays low stock alert when there are low stock items', async () => {
        // Mock the initial inventory with a low stock item
        localStorageMock.setItem('inventory', JSON.stringify([
            {
                id: '2',
                name: 'Plastic Containers',
                category: 'Packaging',
                quantity: 35,
                unit: 'boxes',
                price: 15.75,
                location: 'Warehouse B',
                supplier: 'PlastiPack Inc',
                lastUpdated: new Date().toISOString(),
                minStockLevel: 40,
                status: 'Low Stock'
            }
        ]));

        render(<App />);

        await waitFor(() => {
          expect(screen.getByText(/Attention Required/i)).toBeInTheDocument();
        });
    });


    it('displays no low stock alert when there are no low stock items', async () => {
        // Mock the initial inventory with no low stock item
        localStorageMock.setItem('inventory', JSON.stringify([
            {
                id: '1',
                name: 'Cardboard Boxes',
                category: 'Packaging',
                quantity: 150,
                unit: 'pcs',
                price: 2.5,
                location: 'Warehouse A',
                supplier: 'BoxCo Supplies',
                lastUpdated: new Date().toISOString(),
                minStockLevel: 50,
                status: 'In Stock'
            }
        ]));

        render(<App />);
        await waitFor(() => {
          expect(screen.queryByText(/Attention Required/i)).not.toBeInTheDocument();
        });
    });


  it('opens and closes the modal using the Escape key', async () => {
        render(<App />);

        // Open the modal by clicking on the "Add Item" button
        const addItemButton = await screen.findByRole('button', { name: /Add Item/i });
        fireEvent.click(addItemButton);

        // Verify that the modal is open
        expect(screen.getByText(/Add Inventory Item/i)).toBeVisible();

        // Simulate pressing the Escape key
        fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' });

        // Verify that the modal is closed
        await waitFor(() => {
          expect(screen.queryByText(/Add Inventory Item/i)).not.toBeInTheDocument();
        });
  });
});
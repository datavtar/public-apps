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

// Mock window.confirm
global.confirm = jest.fn(() => true); // Always confirm deletion


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    // Reset to initial sample data
    localStorageMock.setItem(
      'logistics_shipments',
      JSON.stringify([
        {
          id: '1',
          trackingNumber: 'DT123456789',
          origin: 'New York, USA',
          destination: 'London, UK',
          status: 'In Transit',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date().toISOString(),
        },
        {
          id: '2',
          trackingNumber: 'DT987654321',
          origin: 'Shanghai, CN',
          destination: 'Los Angeles, USA',
          status: 'Delivered',
          estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          trackingNumber: 'DT555111222',
          origin: 'Berlin, DE',
          destination: 'Paris, FR',
          status: 'Pending',
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          trackingNumber: 'DT333444555',
          origin: 'Sydney, AU',
          destination: 'Tokyo, JP',
          status: 'Out for Delivery',
          estimatedDelivery: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
      ])
    );
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Logistics Dashboard')).toBeInTheDocument();
  });

  it('loads shipments from localStorage on initial render', () => {
    render(<App />);
    expect(screen.getByText('DT123456789')).toBeInTheDocument();
    expect(screen.getByText('DT987654321')).toBeInTheDocument();
  });

  it('adds a new shipment', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /^Add Shipment$/i });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText('Tracking Number'), { target: { value: 'DT112233445' } });
    fireEvent.change(screen.getByLabelText('Origin'), { target: { value: 'Cairo, EG' } });
    fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Riyadh, SA' } });
    fireEvent.change(screen.getByLabelText('Est. Delivery Date'), { target: { value: '2024-12-31' } });

    const saveButton = screen.getByRole('button', { name: /^Add Shipment$/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('DT112233445')).toBeInTheDocument();
    });

    const storedShipments = JSON.parse(localStorageMock.getItem('logistics_shipments') || '[]');
    expect(storedShipments.some((shipment: any) => shipment.trackingNumber === 'DT112233445')).toBe(true);
  });

    it('edits an existing shipment', async () => {
        render(<App />);
        const editButton = screen.getByRole('button', { name: /^Edit shipment DT123456789$/i });
        fireEvent.click(editButton);

        fireEvent.change(screen.getByLabelText('Tracking Number'), { target: { value: 'EDIT123456789' } });

        const saveButton = screen.getByRole('button', { name: /^Save Changes$/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('EDIT123456789')).toBeInTheDocument();
        });

        const storedShipments = JSON.parse(localStorageMock.getItem('logistics_shipments') || '[]');
        expect(storedShipments.some((shipment: any) => shipment.trackingNumber === 'EDIT123456789')).toBe(true);
    });

  it('deletes a shipment', async () => {
    (global.confirm as jest.Mock).mockImplementation(() => true);

    render(<App />);
    const deleteButton = screen.getByRole('button', { name: /^Delete shipment DT123456789$/i });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('DT123456789')).not.toBeInTheDocument();
    });

    const storedShipments = JSON.parse(localStorageMock.getItem('logistics_shipments') || '[]');
    expect(storedShipments.some((shipment: any) => shipment.trackingNumber === 'DT123456789')).toBe(false);
  });

  it('filters shipments by status', async () => {
    render(<App />);
    const selectElement = screen.getByLabelText('Filter by status');

    fireEvent.change(selectElement, { target: { value: 'Delivered' } });

    await waitFor(() => {
      expect(screen.getByText('Delivered')).toBeInTheDocument();
      expect(screen.queryByText('In Transit')).not.toBeInTheDocument();
    });
  });

  it('toggles theme', () => {
    render(<App />);
    const themeToggleButton = screen.getByRole('button', { name: /^Switch to dark mode$/i });
    fireEvent.click(themeToggleButton);
    expect(localStorageMock.getItem('logistics_theme')).toBe('dark');
    const themeToggleButton2 = screen.getByRole('button', { name: /^Switch to light mode$/i });
    fireEvent.click(themeToggleButton2);
    expect(localStorageMock.getItem('logistics_theme')).toBe('light');
  });


  it('displays "No shipments found" message when no shipments match the search', async () => {
    render(<App />);
    const searchInput = screen.getByRole('textbox', { name: 'Search shipments' });
    fireEvent.change(searchInput, { target: { value: 'nonexistenttrackingnumber' } });

    await waitFor(() => {
        expect(screen.getByText('No shipments found.')).toBeInTheDocument();
    });
});

  it('sorts shipments by tracking number', async () => {
    render(<App />);
    const trackingNumberHeader = screen.getByText(/Tracking #/i);
    fireEvent.click(trackingNumberHeader);


  });



}
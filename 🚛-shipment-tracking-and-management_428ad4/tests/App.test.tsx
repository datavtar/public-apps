import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'


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


// Mock the alert function
global.alert = jest.fn();


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Shipment Tracker/i)).toBeInTheDocument();
  });

  it('displays initial loading state', () => {
    render(<App />);
    expect(localStorage.getItem('shipments')).toBeNull();
  });

  it('loads shipments from local storage if available', () => {
    const mockShipments = JSON.stringify([
      { id: '1', shipmentId: 'SHIP001', location: 'New York', status: 'In Transit', deliveryDate: '2024-03-15', createdAt: new Date().toISOString() },
    ]);
    localStorage.setItem('shipments', mockShipments);

    render(<App />);
    expect(localStorage.getItem('shipments')).toEqual(mockShipments);
  });

  it('displays the shipments table after loading', async () => {
    render(<App />);
    // Wait for the data to load and the table to render
    await waitFor(() => {
        expect(screen.getByText('SHIP001')).toBeInTheDocument();
    });
  });

  it('opens the add shipment modal when the add shipment button is clicked', async () => {
    render(<App />);

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Add Shipment$/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /^Add Shipment$/i });
    fireEvent.click(addButton);

    await waitFor(() => {
        expect(screen.getByText(/Add New Shipment/i)).toBeVisible();
    });

  });


  it('allows adding a new shipment', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Add Shipment$/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^Add Shipment$/i }));

    await waitFor(() => {
        expect(screen.getByText(/Add New Shipment/i)).toBeVisible();
    });

    fireEvent.change(screen.getByLabelText(/Shipment ID/i), { target: { value: 'SHIP006' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'London' } });
    fireEvent.change(screen.getByLabelText(/Delivery Date/i), { target: { value: '2024-04-01' } });

    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'Delivered' } });

    fireEvent.click(screen.getByRole('button', { name: /^Add Shipment$/i }));


    await waitFor(() => {
      expect(screen.getByText('SHIP006')).toBeInTheDocument();
    });
  });


  it('displays error when adding a shipment with missing fields', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Add Shipment$/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^Add Shipment$/i }));

    await waitFor(() => {
        expect(screen.getByText(/Add New Shipment/i)).toBeVisible();
    });

    fireEvent.click(screen.getByRole('button', { name: /^Add Shipment$/i }));

    await waitFor(() => {
      expect(screen.getByText(/All fields are required/i)).toBeInTheDocument();
    });
  });

  it('filters shipments by search term', async () => {
    render(<App />);
    await waitFor(() => {
        expect(screen.getByText('SHIP001')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Search shipments.../i), { target: { value: 'SHIP001' } });
    expect(screen.getByText('SHIP001')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Search shipments.../i), { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.queryByText('SHIP001')).not.toBeInTheDocument();
    });
  });

 it('deletes a shipment', async () => {
    const mockConfirm = jest.spyOn(window, 'confirm');
    mockConfirm.mockImplementation(() => true);

    render(<App />);

    await waitFor(() => {
        expect(screen.getByText('SHIP001')).toBeInTheDocument();
    });

    // Find the delete button for SHIP001
    const deleteButton = screen.getByRole('button', { name: /^Delete SHIP001$/i });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('SHIP001')).not.toBeInTheDocument();
    });

    mockConfirm.mockRestore();
  });
});
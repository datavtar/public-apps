import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

// Mock window.confirm
const originalConfirm = window.confirm;

beforeEach(() => {
  window.confirm = jest.fn(() => true); // Always return true for confirmation
  localStorageMock.clear();
});

afterEach(() => {
  window.confirm = originalConfirm;
});


describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
  });

  it('displays the Shipment Tracker title', () => {
    render(<App />);
    expect(screen.getByText(/Shipment Tracker/i)).toBeInTheDocument();
  });

  it('adds a new shipment', async () => {
    render(<App />);

    // Open the add shipment modal
    fireEvent.click(screen.getByRole('button', { name: /Add Shipment/i }));

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/Tracking ID/i), { target: { value: 'TRK123' } });
    fireEvent.change(screen.getByLabelText(/Customer Name/i), { target: { value: 'Test Customer' } });
    fireEvent.change(screen.getByLabelText(/Address/i, { selector: '#originAddress' }), { target: { value: 'Origin Address' } });
    fireEvent.change(screen.getByLabelText(/Latitude/i, { selector: '#originLat' }), { target: { value: 'Origin Latitude' } });
    fireEvent.change(screen.getByLabelText(/Longitude/i, { selector: '#originLng' }), { target: { value: 'Origin Longitude' } });
    fireEvent.change(screen.getByLabelText(/Address/i, { selector: '#destinationAddress' }), { target: { value: 'Destination Address' } });
    fireEvent.change(screen.getByLabelText(/Latitude/i, { selector: '#destinationLat' }), { target: { value: 'Destination Latitude' } });
    fireEvent.change(screen.getByLabelText(/Longitude/i, { selector: '#destinationLng' }), { target: { value: 'Destination Longitude' } });
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'pending' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Add Shipment/i }));

    // Check if shipment is added to the table
    // await screen.findByText(/Test Customer/i);

    // Assert that the local storage was updated
    const storedShipments = JSON.parse(localStorageMock.getItem('shipments') || '[]');
    expect(storedShipments.length).toBeGreaterThan(0);
    expect(storedShipments[storedShipments.length - 1].customerName).toBe('Test Customer');

  });

  it('deletes a shipment', async () => {
    // Arrange
    render(<App />);

    // Add a shipment to delete
    fireEvent.click(screen.getByRole('button', { name: /Add Shipment/i }));

    fireEvent.change(screen.getByLabelText(/Tracking ID/i), { target: { value: 'TRK123' } });
    fireEvent.change(screen.getByLabelText(/Customer Name/i), { target: { value: 'Delete Customer' } });
    fireEvent.change(screen.getByLabelText(/Address/i, { selector: '#originAddress' }), { target: { value: 'Origin Address' } });
    fireEvent.change(screen.getByLabelText(/Latitude/i, { selector: '#originLat' }), { target: { value: 'Origin Latitude' } });
    fireEvent.change(screen.getByLabelText(/Longitude/i, { selector: '#originLng' }), { target: { value: 'Origin Longitude' } });
    fireEvent.change(screen.getByLabelText(/Address/i, { selector: '#destinationAddress' }), { target: { value: 'Destination Address' } });
    fireEvent.change(screen.getByLabelText(/Latitude/i, { selector: '#destinationLat' }), { target: { value: 'Destination Latitude' } });
    fireEvent.change(screen.getByLabelText(/Longitude/i, { selector: '#destinationLng' }), { target: { value: 'Destination Longitude' } });
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'pending' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Shipment/i }));

    const storedShipments = JSON.parse(localStorageMock.getItem('shipments') || '[]');
    const initialLength = storedShipments.length;

    // Act
    // Find delete button by customername - not great but works
    const deleteButtons = await screen.findAllByRole('button', { name: /Trash2/i });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    // Assert
    const updatedShipments = JSON.parse(localStorageMock.getItem('shipments') || '[]');
    expect(updatedShipments.length).toBe(initialLength - 1);
  });


  it('applies filters', async () => {
    render(<App />);

    // Open the filter modal
    fireEvent.click(screen.getByRole('button', { name: /Filters/i }));

    // Apply status filter
    fireEvent.change(screen.getByLabelText(/Status/i, {selector: '#filterStatus'}), { target: { value: 'delivered' } });
    fireEvent.click(screen.getByRole('button', { name: /Apply Filters/i }));
  });

  it('opens and closes the filter modal', () => {
    render(<App />);

    // Open the filter modal
    fireEvent.click(screen.getByRole('button', { name: /Filters/i }));

    // Check if the filter modal is open
    expect(screen.getByText(/Filter Shipments/i)).toBeInTheDocument();

    // Close the filter modal
    fireEvent.click(screen.getByRole('button', { name: /X/i }));

  });


  it('opens and closes the add shipment modal', () => {
    render(<App />);

    // Open the add shipment modal
    fireEvent.click(screen.getByRole('button', { name: /Add Shipment/i }));

    // Check if the add shipment modal is open
    expect(screen.getByText(/Add New Shipment/i)).toBeInTheDocument();

    // Close the add shipment modal
    fireEvent.click(screen.getByRole('button', { name: /X/i }));

  });

  it('updates search term', () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Search shipments.../i);

    fireEvent.change(searchInput, { target: { value: 'test search' } });

  });

  it('exports to csv', () => {
    render(<App />);

    const exportButton = screen.getByRole('button', { name: /Export/i });

  });

  it('downloads template', () => {
    render(<App />);

    const downloadTemplate = screen.getByRole('button', { name: /Template/i });

  });

  it('imports from csv', () => {
    render(<App />);

    const importCSV = screen.getByRole('button', { name: /Import/i });

  });
});
import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'

// Mock local storage
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



ddescribe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('shipments', JSON.stringify([])); // Initialize with empty array
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Shipment Tracker/i)).toBeInTheDocument();
  });

  it('opens and closes the new shipment modal', async () => {
    render(<App />);

    // Open the modal
    const newShipmentButton = screen.getByRole('button', { name: /New Shipment/i });
    fireEvent.click(newShipmentButton);

    // Check if the modal is open
    expect(screen.getByText(/Create New Shipment/i)).toBeInTheDocument();

    // Close the modal
    const closeButton = screen.getByRole('button', { name: /X/i });
    fireEvent.click(closeButton);

    // Ensure the modal is closed (not present in the document)
    await waitFor(() => {
      expect(screen.queryByText(/Create New Shipment/i)).not.toBeInTheDocument();
    });
  });


  it('adds a new shipment', async () => {
    render(<App />);

    const newShipmentButton = screen.getByRole('button', { name: /New Shipment/i });
    fireEvent.click(newShipmentButton);

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText(/Enter tracking number/i), { target: { value: 'TRK123' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter carrier name/i), { target: { value: 'Test Carrier' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter customer name/i), { target: { value: 'Test Customer' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter origin address/i), { target: { value: 'Test Origin' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter destination address/i), { target: { value: 'Test Destination' } });

    // Set a valid estimated delivery date
    fireEvent.change(screen.getByLabelText(/Estimated Delivery Date/i), {
        target: { value: '2024-01-01' }
    });
    // Submit the form
    const createShipmentButton = screen.getByRole('button', { name: /Create Shipment/i });
    fireEvent.click(createShipmentButton);

    // Wait for the modal to close
    await waitFor(() => {
        expect(screen.queryByText(/Create New Shipment/i)).not.toBeInTheDocument();
    });

    // Verify that the shipment was added
    await waitFor(() => {
        expect(localStorage.getItem('shipments')).not.toBe('[]'); // Check that shipments is not empty
        const shipments = JSON.parse(localStorage.getItem('shipments') || '[]');
        expect(shipments.length).toBe(1);
        expect(shipments[0].trackingNumber).toBe('TRK123');
    });
  });

  it('filters shipments by status', async () => {
    // Arrange
    localStorage.setItem('shipments', JSON.stringify([
        {
            id: 'SHIP-1000',
            trackingNumber: 'TRK123456',
            customer: { name: 'John Doe', email: 'john@example.com', phone: '+1-555-123-4567' },
            origin: { address: '123 Main St, Anytown', coordinates: [37.7749, -122.4194] },
            destination: { address: '456 Elm St, Othertown', coordinates: [34.0522, -118.2437] },
            currentLocation: { coordinates: [35.0, -120.0], updatedAt: new Date().toISOString() },
            status: 'In Transit',
            estimatedDelivery: new Date().toISOString(),
            items: [{ name: 'Product 1', quantity: 1, weight: 1 }],
            createdAt: new Date().toISOString(),
            carrier: 'FastShip'
        }
    ]));

    render(<App />);

    // Act
    const filterButton = screen.getByRole('button', { name: /Filter/i });
    fireEvent.click(filterButton);

    // Wait for the Filter Modal to appear
    await waitFor(() => {
        expect(screen.getByText(/Filter Shipments/i)).toBeVisible();
    });

    const statusSelect = screen.getByLabelText(/Status/i);
    fireEvent.change(statusSelect, { target: { value: 'In Transit' } });

    const applyFiltersButton = screen.getByRole('button', { name: /Apply Filters/i });
    fireEvent.click(applyFiltersButton);

    // Assert
    await waitFor(() => {
        expect(screen.queryByText(/Filter Shipments/i)).not.toBeInTheDocument(); // Check if the filter modal disappears
    });

    // Check if the table is rendered and contains the expected shipment ID
    await waitFor(() => {
        expect(screen.getByText('SHIP-1000')).toBeVisible();
    });
  });

  it('toggles dark mode', () => {
    render(<App />);

    // Check if dark mode is initially off (or on based on system preference)
    const initialDarkMode = document.documentElement.classList.contains('dark');

    // Toggle dark mode
    const themeToggleButton = screen.getByRole('button', { name: initialDarkMode ? /Switch to light mode/i : /Switch to dark mode/i });
    fireEvent.click(themeToggleButton);

    // Check if dark mode is toggled correctly
    expect(document.documentElement.classList.contains('dark')).toBe(!initialDarkMode);
  });


 it('downloads CSV template', () => {
    render(<App />);

    // Mock creating a URL for a blob
    const mockCreateObjectURL = jest.fn();
    URL.createObjectURL = mockCreateObjectURL;

    // Mock appending and clicking the link
    const mockAppendChild = jest.fn();
    const mockClick = jest.fn();

    const originalAppendChild = document.body.appendChild;
    document.body.appendChild = mockAppendChild;

    const originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = mockClick;

    const templateButton = screen.getByRole('button', { name: /Template/i });
    fireEvent.click(templateButton);

    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();

    // Restore the original functions
    document.body.appendChild = originalAppendChild;
    HTMLAnchorElement.prototype.click = originalClick;

    URL.createObjectURL.mockRestore()
  });
});
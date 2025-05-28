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

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
});

// Mock the generateTrackingNumber function to return a fixed value for testing
jest.mock('../src/App', () => {
  const originalModule = jest.requireActual('../src/App') as any;
  return {
    __esModule: true,
    ...originalModule,
    default: () => {
      // Mock the generateTrackingNumber function inside the component
      const AppWithMocks = originalModule.default;
      AppWithMocks.__mockGenerateTrackingNumber = () => 'MOCKED_TRACKING_NUMBER';
      return React.createElement(AppWithMocks);
    },
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('ParcelTracker Pro')).toBeInTheDocument();
  });

  test('initializes with sample parcels from localStorage or default', () => {
    const sampleParcels = [
      {
        id: '1',
        trackingNumber: 'TRK001234567',
        status: 'in_transit',
        currentLocation: 'Distribution Center - New York',
        estimatedDelivery: '2025-01-25',
        recipient: {
          name: 'John Smith',
          address: '123 Main St, Boston, MA 02101',
          phone: '+1-555-0123',
          email: 'john.smith@email.com',
        },
        sender: {
          name: 'ABC Electronics',
          address: '456 Industrial Blvd, Newark, NJ 07102',
        },
        weight: 2.5,
        dimensions: '12x8x6 inches',
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-23T14:30:00Z',
        statusHistory: [
          {
            status: 'pending',
            location: 'Warehouse - Newark',
            timestamp: '2025-01-20T10:00:00Z',
            notes: 'Package received and processed',
          },
          {
            status: 'in_transit',
            location: 'Distribution Center - New York',
            timestamp: '2025-01-23T14:30:00Z',
            notes: 'In transit to destination',
          },
        ],
        priority: 'medium',
        serviceType: 'standard',
      },
    ];
    localStorageMock.setItem('parcels', JSON.stringify(sampleParcels));
    render(<App />);
    expect(screen.getByText('TRK001234567')).toBeInTheDocument();
  });

  test('opens and closes the add parcel modal', async () => {
    render(<App />);

    // Open the add parcel modal
    const addButton = screen.getByRole('button', { name: /Add Parcel/i });
    fireEvent.click(addButton);

    // Check if the modal is open by looking for a specific element within it
    expect(screen.getByText('Add New Parcel')).toBeInTheDocument();

    // Close the modal
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

  });

  test('adds a new parcel', async () => {
    render(<App />);

    // Open the add parcel modal
    const addButton = screen.getByRole('button', { name: /Add Parcel/i });
    fireEvent.click(addButton);

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'pending' } });
    fireEvent.change(screen.getByLabelText(/Priority/i), { target: { value: 'medium' } });
    fireEvent.change(screen.getByLabelText(/Service Type/i), { target: { value: 'standard' } });
    fireEvent.change(screen.getByLabelText(/Estimated Delivery Date/i), { target: { value: '2025-02-01' } });
    fireEvent.change(screen.getByLabelText(/Current Location/i), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText(/Name/i, {selector: 'input'}), { target: { value: 'Test Recipient' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '123-456-7890' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Address/i, {selector: 'textarea'}), { target: { value: 'Test Address' } });
    fireEvent.change(screen.getByLabelText(/Name/i, {selector: 'input'}), { target: { value: 'Test Sender Name' } });
    fireEvent.change(screen.getByLabelText(/Address/i, {selector: 'input'}), { target: { value: 'Test Sender Address' } });
    fireEvent.change(screen.getByLabelText(/Weight \(kg\)/i), { target: { value: '1.5' } });
    fireEvent.change(screen.getByLabelText(/Dimensions/i), { target: { value: '10x5x2' } });

    // Submit the form
    const addParcelButton = screen.getByRole('button', { name: /Add Parcel/i });
    fireEvent.click(addParcelButton);

    // Verify that a new parcel has been added to the list
    // Wait for the localStorage to update and component to re-render
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(localStorageMock.getItem('parcels')).toContain('Test Recipient');
    expect(localStorageMock.getItem('parcels')).toContain('MOCKED_TRACKING_NUMBER');
  });
});
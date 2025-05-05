import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the leaflet map
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="map-container">{children}</div>;
  },
  TileLayer: () => <div data-testid="tile-layer"></div>,
  Marker: () => <div data-testid="marker"></div>,
  Popup: () => <div data-testid="popup"></div>,
}));


// Mock the date-fns
jest.mock('date-fns', () => {
  const originalModule = jest.requireActual('date-fns');
  return {
    __esModule: true,
    ...originalModule,
    format: jest.fn((date, format) => {
      if (date instanceof Date) {
          return '2025-03-10';
      } else {
          return originalModule.format(date, format);
      }
    }),
    addDays: jest.fn(() => new Date('2025-03-10')),
    isPast: jest.fn(() => false),
    isToday: jest.fn(() => false),
  };
});


d describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders header with title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Shipment Tracker/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders the shipments table', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/TRK123456789/i)).toBeInTheDocument();
    });
  });

  test('opens and closes the add shipment modal', async () => {
    render(<App />);

    const addShipmentButton = screen.getByRole('button', { name: /^Add Shipment$/i });
    fireEvent.click(addShipmentButton);

    expect(screen.getByText(/Add New Shipment/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
        expect(screen.queryByText(/Add New Shipment/i)).not.toBeInTheDocument();
    });
  });

  test('adds a new shipment', async () => {
    render(<App />);

    const addShipmentButton = screen.getByRole('button', { name: /^Add Shipment$/i });
    fireEvent.click(addShipmentButton);

    fireEvent.change(screen.getByLabelText(/Tracking Number\*/i), { target: { value: 'NEWTRACKING123' } });
    fireEvent.change(screen.getByLabelText(/Customer\*/i), { target: { value: 'New Customer' } });
    fireEvent.change(screen.getByLabelText(/Origin\*/i), { target: { value: 'New Origin' } });
    fireEvent.change(screen.getByLabelText(/Destination\*/i), { target: { value: 'New Destination' } });
    fireEvent.change(screen.getByLabelText(/Carrier\*/i), { target: { value: 'New Carrier' } });
    fireEvent.change(screen.getByLabelText(/Weight \(kg\)\*/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: 'New Address' } });
    fireEvent.change(screen.getByLabelText(/Latitude/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Longitude/i), { target: { value: '10' } });

    const addSubmitButton = screen.getByRole('button', { name: /Add Shipment/i });
    fireEvent.click(addSubmitButton);

    await waitFor(() => {
      expect(screen.getByText(/NEWTRACKING123/i)).toBeInTheDocument();
    });
  });

  test('renders map view when map tab is clicked', async () => {
    render(<App />);
    const mapTabButton = screen.getByRole('button', { name: /Map View/i });
    fireEvent.click(mapTabButton);
    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });

  test('filters shipments by tracking number', async () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Search by tracking #, customer, origin, or destination/i);
    fireEvent.change(searchInput, { target: { value: 'TRK123456789' } });
    await waitFor(() => {
      expect(screen.getByText(/TRK123456789/i)).toBeInTheDocument();
      expect(screen.queryByText(/TRK987654321/i)).not.toBeInTheDocument();
    });
  });

  test('displays alert messages', async () => {
    render(<App />);
    await waitFor(() => {
        expect(screen.getByText(/Shipment TRK987654321 has been delivered to the recipient/i)).toBeInTheDocument();
    });
  });
});
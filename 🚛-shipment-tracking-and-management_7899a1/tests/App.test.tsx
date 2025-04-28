import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

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

// Mock the generateId function
const mockGenerateId = jest.fn(() => 'mockedId');
jest.mock('../src/App', () => {
  const originalModule = jest.requireActual('../src/App');
  return {
    __esModule: true,
    ...originalModule,
    generateId: mockGenerateId,
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders learn react link', () => {
    render(<App />);
    expect(screen.getByText(/Shipment Tracker/i)).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText(/Loading shipments.../i)).toBeInTheDocument();
  });

  test('displays an error message when local storage fails to load', async () => {
      localStorage.setItem('shipmentsData', 'invalid json');

      render(<App />);

      await waitFor(() => {
          expect(screen.getByText(/Failed to load saved shipment data/i)).toBeInTheDocument();
      });
  });

  test('adds a new shipment', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading shipments.../i)).not.toBeInTheDocument();
    });

    // Open the modal
    fireEvent.click(screen.getByRole('button', { name: /Add Shipment/i }));

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Tracking Number/i), { target: { value: 'TRACK123' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'Pending' } });
    fireEvent.change(screen.getByLabelText(/Expected Delivery Date/i), { target: { value: '2024-12-31' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Add Shipment/i }));

    // Verify that the shipment was added
    await waitFor(() => {
      expect(screen.getByText(/TRACK123/i)).toBeInTheDocument();
    });
  });

  test('deletes a shipment', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading shipments.../i)).not.toBeInTheDocument();
    });

    // Confirm deletion
    window.confirm = jest.fn(() => true);

    // Delete the first shipment
    const deleteButtons = screen.getAllByRole('button', { name: /Delete shipment/i });
    fireEvent.click(deleteButtons[0]);

    // Verify that the shipment was deleted
    await waitFor(() => {
      expect(screen.queryByText(/TRACK12345/i)).not.toBeInTheDocument();
    });
  });

  test('filters shipments by status', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading shipments.../i)).not.toBeInTheDocument();
    });

    // Filter by status
    fireEvent.change(screen.getByLabelText(/Filter by status/i), { target: { value: 'Delivered' } });

    // Verify that only shipments with the selected status are displayed
    await waitFor(() => {
      expect(screen.getByText(/Delivered/i)).toBeInTheDocument();
      expect(screen.queryByText(/In Transit/i)).not.toBeInTheDocument();
    });
  });

  test('downloads CSV template', async () => {
      const mockCreateObjectURL = jest.fn();
      const mockAppendChild = jest.fn();
      const mockClick = jest.fn();
      const mockRemoveChild = jest.fn();

      global.URL.createObjectURL = mockCreateObjectURL;
      document.body.appendChild = mockAppendChild;

      const createElementSpy = jest.spyOn(document, 'createElement');
      createElementSpy.mockImplementation((tagName: string) => {
          if (tagName === 'a') {
              return {
                  setAttribute: jest.fn(),
                  click: mockClick,
                  remove: mockRemoveChild,
                  href: '',
              } as any;
          }
          return document.createElement(tagName);
      });

      render(<App />);
      await waitFor(() => {
          expect(screen.queryByText(/Loading shipments.../i)).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Upload/i }));
      fireEvent.click(screen.getByText(/Download CSV Template/i));

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();

      createElementSpy.mockRestore();
  });
});
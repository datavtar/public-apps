import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the authContext
const mockAuthContextValue = {
  currentUser: {
    first_name: 'TestUser'
  },
  logout: jest.fn()
};

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

// Helper function to render the component with the mock context
const renderWithContext = (ui: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContextValue}>
      {ui}
    </AuthContext.Provider>
  );
};


test('renders the component', () => {
  renderWithContext(<App />);
  expect(screen.getByText(/ShipTracker Pro/i)).toBeInTheDocument();
});

test('renders welcome message with current user\'s first name', () => {
  renderWithContext(<App />);
  expect(screen.getByText(/Welcome, TestUser/i)).toBeInTheDocument();
});

test('logout button calls logout function from authContext', async () => {
  renderWithContext(<App />);
  const logoutButton = screen.getByRole('button', { name: /Logout/i });
  fireEvent.click(logoutButton);
  await waitFor(() => expect(mockAuthContextValue.logout).toHaveBeenCalled());
});

test('navigates to shipments tab', () => {
  renderWithContext(<App />);
  const shipmentsTab = screen.getByRole('button', { name: /Shipments/i });
  fireEvent.click(shipmentsTab);
  expect(screen.getByText(/Shipments/i)).toBeInTheDocument();
});

test('renders dashboard tab initially', () => {
  renderWithContext(<App />);
  expect(screen.getByText(/Recent Shipments/i)).toBeInTheDocument();
});


test('shows the add shipment modal when add shipment button is clicked', async () => {
  renderWithContext(<App />);

  const addShipmentButton = screen.getByRole('button', { name: /Add Shipment/i });
  fireEvent.click(addShipmentButton);
  
  await waitFor(() => {
    expect(screen.getByText(/Add New Shipment/i)).toBeInTheDocument();
  });
});

test('displays the import shipments modal when the import button is clicked', async () => {
  renderWithContext(<App />);
  const shipmentsTab = screen.getByRole('button', { name: /Shipments/i });
  fireEvent.click(shipmentsTab);
  const importButton = screen.getByRole('button', { name: /Import/i });
  fireEvent.click(importButton);
  await waitFor(() => expect(screen.getByText(/Import Shipments/i)).toBeInTheDocument());
});

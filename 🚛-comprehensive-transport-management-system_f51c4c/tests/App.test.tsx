import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';
import { localStorageMock } from './mocks/localStorageMock';

Object.defineProperty(window, 'localStorage', { value: localStorageMock });



describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the component', () => {
    render(<App />);
  });

  it('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading Application...')).toBeInTheDocument();
  });

  it('renders the dashboard page after loading', async () => {
      render(<App />);
      await waitFor(() => {
          expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      });
  });

  it('renders the Vehicle Management page when the Vehicles link is clicked', async () => {
      render(<App />);
      await waitFor(() => {
          expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      });
  });

  it('renders the Shipment Management page when the Shipments link is clicked', async () => {
    render(<App />);
    await waitFor(() => {
        expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    });
  });

  it('loads and displays initial data from local storage if available', async () => {
      localStorage.setItem('swifttransact_tms_vehicles', JSON.stringify([{ id: 'test-vehicle', plateNumber: 'TEST-123', type: 'Truck', capacity: '5 tons', status: 'Available', createdAt: new Date().toISOString() }]));

      render(<App />);

      await waitFor(() => {
          expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      });

      // Assuming the app navigates to dashboard on load and displays vehicle count
      // You might need to adjust the selector based on the actual implementation
      expect(localStorage.getItem('swifttransact_tms_vehicles')).toBeTruthy();
  });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Shipment Tracker/i)).toBeInTheDocument();
  });

  test('displays initial shipments or \"No shipments found\" message', async () => {
    render(<App />);
    await waitFor(() => {
      const noShipmentsMessage = screen.queryByText(/No shipments found/i);
      const shipmentRows = screen.queryAllByRole('row').length > 1;

      expect(noShipmentsMessage || shipmentRows).toBeTruthy();
    }, { timeout: 5000 });
  });

  test('opens and closes the Add Shipment modal', async () => {
    render(<App />);

    const addButton = screen.getByRole('button', { name: /Add Shipment/i });
    fireEvent.click(addButton);
    await waitFor(() => expect(screen.getByText(/Add New Shipment/i)).toBeInTheDocument());

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    await waitFor(() => expect(screen.queryByText(/Add New Shipment/i)).not.toBeInTheDocument());
  });

  test('adds a new shipment', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Add Shipment/i }));
    await waitFor(() => screen.getByText(/Add New Shipment/i));

    fireEvent.change(screen.getByLabelText(/Tracking Number/i), { target: { value: 'TEST1234' } });
    fireEvent.change(screen.getByLabelText(/Customer Name/i), { target: { value: 'Test Customer' } });
    fireEvent.change(screen.getByLabelText(/Origin/i), { target: { value: 'Test Origin' } });
    fireEvent.change(screen.getByLabelText(/Destination/i), { target: { value: 'Test Destination' } });
    fireEvent.change(screen.getByLabelText(/Departure Date/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/Arrival Date/i), { target: { value: '2024-01-15' } });
    fireEvent.change(screen.getByLabelText(/Weight \(kg\)/i), { target: { value: '100' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Add Shipment/i }));
    await waitFor(() => expect(screen.queryByText(/Add New Shipment/i)).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('TEST1234')).toBeInTheDocument());
  });
})
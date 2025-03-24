import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';




describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Shipment Monitoring/i)).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test('renders shipments after loading', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());
    expect(screen.getByText(/New York/i)).toBeInTheDocument();
    expect(screen.getByText(/Los Angeles/i)).toBeInTheDocument();
  });

  test('opens the add shipment modal when Add Shipment button is clicked', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());
    const addButton = screen.getByRole('button', { name: /Add Shipment/i });
    fireEvent.click(addButton);
    expect(screen.getByText(/Add Shipment/i)).toBeVisible();
  });

  test('filters shipments based on search term', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/Search shipments/i);
    fireEvent.change(searchInput, { target: { value: 'New York' } });

    expect(screen.getByText(/New York/i)).toBeInTheDocument();
    expect(screen.queryByText(/Chicago/i)).not.toBeInTheDocument();
  });

 test('filters shipments based on status', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());

    const statusFilter = screen.getByRole('combobox');
    fireEvent.change(statusFilter, { target: { value: 'DELIVERED' } });

    expect(screen.getByText(/Delivered on time/i)).toBeInTheDocument();
    expect(screen.queryByText(/In Transit/i)).not.toBeInTheDocument();
  });
});
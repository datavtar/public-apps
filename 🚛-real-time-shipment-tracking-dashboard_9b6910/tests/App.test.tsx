import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import App from '../src/App'


describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('displays loading state initially', () => {
    render(<App />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test('renders shipment data after loading', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/TRK12345678/i)).toBeInTheDocument();
    expect(screen.getByText(/New York, NY/i)).toBeInTheDocument();
  });


  test('opens and closes the add shipment modal', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /^Add Shipment$/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Add New Shipment/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /^Cancel$/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText(/Add New Shipment/i)).not.toBeInTheDocument();
    });
  });


  test('filters shipments by status', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    const statusFilter = screen.getByLabelText(/Filter by status/i);
    fireEvent.change(statusFilter, { target: { value: 'delivered' } });

    await waitFor(() => {
      expect(screen.getByText(/Delivered/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/In Transit/i)).not.toBeInTheDocument();
  });

  test('searches shipments by tracking number', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search shipments/i);
    fireEvent.change(searchInput, { target: { value: 'TRK12345678' } });

    await waitFor(() => {
      expect(screen.getByText(/TRK12345678/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/TRK87654321/i)).not.toBeInTheDocument();
  });

  test('toggles dark mode', async () => {
    render(<App />);

    const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i})
    fireEvent.click(darkModeButton);
  })

  test('resets filters', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    const statusFilter = screen.getByLabelText(/Filter by status/i);
    fireEvent.change(statusFilter, { target: { value: 'delivered' } });

    const searchInput = screen.getByPlaceholderText(/Search shipments/i);
    fireEvent.change(searchInput, { target: { value: 'TRK12345678' } });

    const resetButton = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(statusFilter).toHaveValue('all');
      expect(searchInput).toHaveValue('');
    });
  });
});
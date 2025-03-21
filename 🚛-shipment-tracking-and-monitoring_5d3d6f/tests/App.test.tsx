import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Shipment Dashboard/i)).toBeInTheDocument();
  });

  test('displays shipment data', () => {
    render(<App />);
    expect(screen.getByText(/SHP-2023-001/i)).toBeInTheDocument();
    expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument();
  });

  test('opens and closes the add shipment modal', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /^Add Shipment$/i });
    fireEvent.click(addButton);
    expect(screen.getByText(/Add New Shipment/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /^Cancel$/i });
    fireEvent.click(cancelButton);
    expect(screen.queryByText(/Add New Shipment/i)).not.toBeInTheDocument();
  });

  test('filters shipments by status', async () => {
    render(<App />);
    const filterButton = screen.getByRole('button', { name: /Filters/i });
    fireEvent.click(filterButton);

    const inTransitRadio = screen.getByRole('radio', { name: /In Transit/i });
    fireEvent.click(inTransitRadio);

    const applyFiltersButton = screen.getByRole('button', { name: /Apply Filters/i });
    fireEvent.click(applyFiltersButton);

    expect(screen.getByText(/In Transit/i)).toBeInTheDocument();
    expect(screen.queryByText(/Delivered/i)).not.toBeInTheDocument();
  });

  test('opens and closes the shipment details modal', () => {
    render(<App />);
    const viewDetailsButton = screen.getAllByRole('button', { name: /View details/i })[0];
    fireEvent.click(viewDetailsButton);
    expect(screen.getByText(/Shipment Details/i)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText(/Shipment Details/i)).not.toBeInTheDocument();
  });

  test('reset filters button works', async () => {
    render(<App />);

    // Open filters
    const filterButton = screen.getByRole('button', { name: /Filters/i });
    fireEvent.click(filterButton);

    // Apply a filter
    const delayedRadio = screen.getByRole('radio', { name: /Delayed/i });
    fireEvent.click(delayedRadio);

    const applyFiltersButton = screen.getByRole('button', { name: /Apply Filters/i });
    fireEvent.click(applyFiltersButton);

    // Check that only delayed shipments are displayed
    expect(screen.getByText(/Delayed/i)).toBeInTheDocument();
    expect(screen.queryByText(/In Transit/i)).not.toBeInTheDocument();

    // Click on Reset Filters button
    const resetButton = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetButton);

    // Check that all shipments are displayed
    expect(screen.getByText(/In Transit/i)).toBeInTheDocument();
    expect(screen.getByText(/Delivered/i)).toBeInTheDocument();
    expect(screen.getByText(/Delayed/i)).toBeInTheDocument();
  });
});
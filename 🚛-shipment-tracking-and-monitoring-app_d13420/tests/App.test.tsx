import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';




test('renders learn react link', () => {
  render(<App />);
  expect(screen.getByText(/Shipment Monitoring/i)).toBeInTheDocument();
});

test('displays loading state initially', () => {
  render(<App />);
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();
});

test('renders shipment data after loading', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());
    expect(screen.getByText(/New York/i)).toBeInTheDocument();
    expect(screen.getByText(/Los Angeles/i)).toBeInTheDocument();
});

test('allows adding a new shipment', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Add Shipment/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /Destination/i }), { target: { value: 'Berlin' } });
    fireEvent.change(screen.getByRole('textbox', { name: /Delivery Date/i }), { target: { value: '2024-04-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));

    await waitFor(() => {
        expect(screen.getByText(/Berlin/i)).toBeInTheDocument();
    });
});

test('allows filtering shipments by status', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());

    fireEvent.change(screen.getByRole('combobox', { name: /filterStatus/i }), { target: { value: 'Delivered' } });

    // Assert that only delivered shipments are displayed
    expect(screen.getByText(/Delivered/i)).toBeVisible();
    expect(screen.queryByText(/In Transit/i)).not.toBeInTheDocument();
});

test('allows searching shipments by destination', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());

    fireEvent.change(screen.getByRole('searchbox', { name: /search/i }), { target: { value: 'New York' } });

    // Assert that only shipments matching the search term are displayed
    expect(screen.getByText(/New York/i)).toBeVisible();
    expect(screen.queryByText(/Los Angeles/i)).not.toBeInTheDocument();
});

test('allows deleting a shipment', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());

    const deleteButton = screen.getByRole('button', { name: /delete-1/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText(/New York/i)).not.toBeInTheDocument();
    });
});

test('allows editing a shipment', async () => {
  render(<App />);

  // Wait for loading to finish
  await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: /edit-1/i }));
  fireEvent.change(screen.getByRole('textbox', { name: /edit-destination/i }), { target: { value: 'New York Edited' } });
  fireEvent.click(screen.getByRole('button', { name: /Save/i }));

  await waitFor(() => {
    expect(screen.getByText(/New York Edited/i)).toBeInTheDocument();
  });
});
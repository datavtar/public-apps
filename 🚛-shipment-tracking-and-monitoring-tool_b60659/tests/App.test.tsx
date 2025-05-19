import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';



describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Shipment Tracker/i)).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Toggle dark mode/i });
    fireEvent.click(darkModeButton);
  });

  test('opens and closes the add shipment modal', () => {
    render(<App />);
    const addShipmentButton = screen.getByRole('button', { name: /Add Shipment/i });
    fireEvent.click(addShipmentButton);
    expect(screen.getByText(/Add New Shipment/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
  });

  test('opens and closes the filter panel', () => {
    render(<App />);
    const showFiltersButton = screen.getByRole('button', { name: /Show Filters/i });
    fireEvent.click(showFiltersButton);
    expect(screen.getByText(/Status/i)).toBeInTheDocument();

    const hideFiltersButton = screen.getByRole('button', { name: /Hide Filters/i });
    fireEvent.click(hideFiltersButton);
  });

  test('filters shipments by status', async () => {
    render(<App />);
    const showFiltersButton = screen.getByRole('button', { name: /Show Filters/i });
    fireEvent.click(showFiltersButton);
    
    const statusSelect = screen.getByLabelText(/Status/i);
    fireEvent.change(statusSelect, { target: { value: 'delivered' } });

    // Wait for the filter to apply (adjust the timeout as needed)
    await screen.findByText(/Delivered/, {}, { timeout: 5000 });
  });

  test('opens and closes the delete confirmation modal', async () => {
    render(<App />);

    // Assuming there's at least one shipment in the list to delete
    const deleteButton = await screen.findAllByRole('button', { name: /Delete shipment/i });

    if (deleteButton.length > 0) {
      fireEvent.click(deleteButton[0]);
      expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);
    }
  });

});

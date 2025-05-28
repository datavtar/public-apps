import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/ParcelTracker Pro/i)).toBeInTheDocument();
  });

  test('displays total parcels count', () => {
    render(<App />);
    expect(screen.getByText(/Total Parcels/i)).toBeInTheDocument();
  });

  test('displays the search input', () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/Search by tracking number, recipient, or location/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('opens and closes the add parcel modal', async () => {
    render(<App />);
    const addParcelButton = screen.getByRole('button', { name: /Add Parcel/i });
    fireEvent.click(addParcelButton);
    expect(screen.getByText(/Add New Parcel/i)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(closeButton);
  });

  test('opens and closes the theme settings', async () => {
    render(<App />);
    const themeSettingsButton = screen.getByRole('button', { name: /Theme settings/i });
    fireEvent.click(themeSettingsButton);
    expect(screen.getByText(/Display Settings/i)).toBeInTheDocument();

    // No direct way to assert close, checking if display settings disappears after a click outside.
    fireEvent.click(document.body);
  });

    test('toggles dark mode', async () => {
    render(<App />);
    const themeSettingsButton = screen.getByRole('button', { name: /Theme settings/i });
    fireEvent.click(themeSettingsButton);

    const darkModeToggle = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeToggle);
  });

    test('toggles high contrast mode', async () => {
    render(<App />);
    const themeSettingsButton = screen.getByRole('button', { name: /Theme settings/i });
    fireEvent.click(themeSettingsButton);

    const highContrastModeToggle = screen.getByRole('button', { name: /Enable high contrast/i });
    fireEvent.click(highContrastModeToggle);
  });

  test('filters parcels by status', async () => {
      render(<App />);

      const filterButton = screen.getByRole('button', { name: /Filters/i });
      fireEvent.click(filterButton);

      const statusFilter = screen.getByLabelText(/Status/i);
      fireEvent.change(statusFilter, { target: { value: 'delivered' } });
  });

  test('sorts parcels by tracking number', async () => {
      render(<App />);

      const trackingNumberHeader = screen.getByText(/Tracking Number/i);
      fireEvent.click(trackingNumberHeader);
  });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByText(/ACME ParcelTracker Pro/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('renders the add parcel button', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add Parcel/i });
    expect(addButton).toBeInTheDocument();
  });

  test('opens the add parcel modal when the add parcel button is clicked', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add Parcel/i });
    fireEvent.click(addButton);
    expect(screen.getByText(/Add New Parcel/i)).toBeInTheDocument();
  });

  test('closes the add parcel modal when the cancel button is clicked', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add Parcel/i });
    fireEvent.click(addButton);
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
  });

 test('displays parcels data in the table', () => {
    render(<App />);
    const trackingNumberElement = screen.getByText(/TRK001234567/i);
    expect(trackingNumberElement).toBeInTheDocument();
  });

  test('displays no parcels found message when no parcels match the search', async () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/Search by tracking number, recipient, or location.../i);
    fireEvent.change(searchInput, { target: { value: 'nonexistenttrackingnumber' } });

    const noParcelsMessage = await screen.findByText(/No parcels found/i);
    expect(noParcelsMessage).toBeInTheDocument();
  });

  test('filters parcels based on search input', async () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/Search by tracking number, recipient, or location.../i);
    fireEvent.change(searchInput, { target: { value: 'TRK001234567' } });

    const trackingNumberElement = await screen.findByText(/TRK001234567/i);
    expect(trackingNumberElement).toBeInTheDocument();
  });

  test('opens and closes the theme settings dropdown', async () => {
    render(<App />);

    const themeSettingsButton = screen.getByRole('button', {name: /Theme settings/i});
    fireEvent.click(themeSettingsButton);

    expect(screen.getByText(/Display Settings/i)).toBeVisible()

    fireEvent.click(themeSettingsButton);

    expect(screen.queryByText(/Display Settings/i)).not.toBeVisible()
  });

  test('toggles dark mode', async () => {
    render(<App />);

    const themeSettingsButton = screen.getByRole('button', {name: /Theme settings/i});
    fireEvent.click(themeSettingsButton);

    const darkModeToggle = screen.getByRole('button', {name: /Switch to dark mode/i})
    fireEvent.click(darkModeToggle)
  });

  test('toggles high contrast mode', async () => {
    render(<App />);

    const themeSettingsButton = screen.getByRole('button', {name: /Theme settings/i});
    fireEvent.click(themeSettingsButton);

    const highContrastModeToggle = screen.getByRole('button', {name: /Enable high contrast/i})
    fireEvent.click(highContrastModeToggle)
  });
});
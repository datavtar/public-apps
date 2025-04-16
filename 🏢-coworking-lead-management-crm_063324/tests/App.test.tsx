import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Coworking CRM/i)).toBeInTheDocument();
  });

  test('opens and closes the add lead modal', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add Lead/i });
    fireEvent.click(addButton);
    expect(screen.getByText(/Add New Lead/i)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { "aria-label": /Close modal/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText(/Add New Lead/i)).not.toBeInTheDocument();
  });

  test('opens and closes the filter modal', () => {
    render(<App />);
    const filterButton = screen.getByRole('button', { name: /Filter/i });
    fireEvent.click(filterButton);
    expect(screen.getByText(/Filter Leads/i)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { "aria-label": /Close modal/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText(/Filter Leads/i)).not.toBeInTheDocument();
  });

  test('opens and closes the import modal', () => {
    render(<App />);
    const exportImportButton = screen.getByRole('button', {name: /Export\/Import/i})
    fireEvent.click(exportImportButton);
    const importButton = screen.getByRole('button', { name: /Import from CSV/i });
    fireEvent.click(importButton);
    expect(screen.getByText(/Import Leads/i)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { "aria-label": /Close modal/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText(/Import Leads/i)).not.toBeInTheDocument();
  });

  test('allows searching leads', () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/Search leads.../i);
    fireEvent.change(searchInput, { target: { value: 'Jane Smith' } });
    
  });

  test('shows no leads message when there are no leads after filter', async () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Search leads.../i);
    fireEvent.change(searchInput, { target: { value: 'nonExistingLead' } });

    expect(await screen.findByText(/No leads match your search criteria./i)).toBeInTheDocument();
  });
});
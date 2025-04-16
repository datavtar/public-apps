import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';



describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);

    expect(screen.getByText(/PuneWork CRM/i)).toBeInTheDocument();
  });

  test('adds a new lead', async () => {
    render(<App />);

    // Arrange
    const addButton = screen.getByRole('button', { name: /Add Lead/i });

    // Act
    fireEvent.click(addButton);

    const nameInput = screen.getByLabelText(/Name*/i);
    const emailInput = screen.getByLabelText(/Email*/i);
    const phoneInput = screen.getByLabelText(/Phone*/i);
    const companyInput = screen.getByLabelText(/Company*/i);
    const requirementsInput = screen.getByLabelText(/Requirements*/i);
    const saveButton = screen.getByRole('button', { name: /Save Lead/i });

    fireEvent.change(nameInput, { target: { value: 'Test Name' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(companyInput, { target: { value: 'Test Company' } });
    fireEvent.change(requirementsInput, { target: { value: 'Test Requirements' } });

    fireEvent.click(saveButton);

    await waitFor(() => {
        expect(screen.getByText('Test Name')).toBeInTheDocument();
    });


  });

  test('filters leads by search', async () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Search leads.../i);

    fireEvent.change(searchInput, { target: { value: 'Priya Sharma' } });

    await waitFor(() => {
        expect(screen.getByText(/Priya Sharma/i)).toBeInTheDocument();
    });


    fireEvent.change(searchInput, { target: { value: '' } });
  });

  test('deletes a lead', async () => {
    render(<App />);

    // Arrange
    let deleteButton;

    await waitFor(() => {
        deleteButton = screen.getAllByRole('button', { name: /Delete lead/i })[0];
    });

    const row = deleteButton.closest('tr');
    const startingRows = screen.getAllByRole('row');

    // Act
    fireEvent.click(deleteButton);

    window.confirm = jest.fn(() => true);

    // Assert
    await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeLessThan(startingRows.length)
    });
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });

    fireEvent.click(darkModeButton);

    expect(document.documentElement.classList.contains('dark')).toBe(true);

    const lightModeButton = screen.getByRole('button', { name: /Switch to light mode/i });

    fireEvent.click(lightModeButton);

    expect(document.documentElement.classList.contains('dark')).toBe(false);

  });

  test('opens and closes the filter', async () => {
    render(<App />);

    const filterButton = screen.getByRole('button', { name: /Filters/i });

    fireEvent.click(filterButton);
    
    const statusFilter = await screen.findByLabelText(/Status/i)

    expect(statusFilter).toBeVisible()

    fireEvent.click(filterButton);

    await waitFor(() => {
        expect(statusFilter).not.toBeVisible()
    });

  });
});
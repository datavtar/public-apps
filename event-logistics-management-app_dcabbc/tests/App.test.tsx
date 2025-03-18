import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';




test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/School Event Logistics/i);
  expect(linkElement).toBeInTheDocument();
});

test('shows loading state', () => {
  render(<App />);
  expect(screen.getByText(/Science Labs/i)).toBeInTheDocument();
});

test('add new event', async () => {
    render(<App />);

    const nameInput = screen.getByRole('textbox', { name: /Event Name/i })
    const dateInput = screen.getByRole('textbox', { name: /Event Date/i })
    const venueInput = screen.getByRole('textbox', { name: /Event Venue/i })
    const descriptionInput = screen.getByRole('textbox', { name: /Event Description/i })
    const statusSelect = screen.getByRole('listbox', { name: /Event Status/i })
    const addButton = screen.getByRole('button', { name: /Add Event/i })

    fireEvent.change(nameInput, { target: { value: 'New Event' } });
    fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
    fireEvent.change(venueInput, { target: { value: 'Home' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Event' } });
    fireEvent.change(statusSelect, { target: { value: 'Completed' } });

    fireEvent.click(addButton);

    await waitFor(() => {
        expect(screen.getByText(/New Event/i)).toBeInTheDocument();
    })
});

test('delete an event', async () => {
    render(<App />);

    await waitFor(() => {
        const deleteButton = screen.getAllByRole('button', {name: /Delete/i})[0];
        fireEvent.click(deleteButton);
    })


    await waitFor(() => {
      expect(screen.queryByText(/Annual School Fest/i)).not.toBeInTheDocument();
    })
});

test('filter events by search term', async () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Search.../i);
    fireEvent.change(searchInput, { target: { value: 'Science' } });

    await waitFor(() => {
        expect(screen.getByText(/Science Exhibition/i)).toBeInTheDocument();
        expect(screen.queryByText(/Annual School Fest/i)).not.toBeInTheDocument();
    })
});

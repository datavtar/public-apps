import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});


// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(), // New method
    removeEventListener: jest.fn(), // New method
    dispatchEvent: jest.fn(),
  })),
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays error message when loading fails', async () => {
    localStorage.setItem('events', 'invalid json');
    render(<App />);

    // Wait for the component to finish loading (mocking a delay)
    await waitFor(() => expect(screen.getByText('Failed to load events.')).toBeInTheDocument());
  });

  test('adds a new event', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    const eventNameInput = screen.getByRole('textbox', { name: /event name:/i });
    const eventDateInput = screen.getByRole('textbox', { name: /date:/i });
    const eventVenueInput = screen.getByRole('textbox', { name: /venue:/i });

    fireEvent.change(eventNameInput, { target: { value: 'Test Event' } });
    fireEvent.change(eventDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(eventVenueInput, { target: { value: 'Test Venue' } });

    const addButton = screen.getByRole('button', { name: /^Add Event$/i });
    fireEvent.click(addButton);

    await waitFor(() => expect(screen.getByRole('cell', { name: 'Test Event' })).toBeInTheDocument());
    expect(screen.getByRole('cell', { name: '2024-01-01' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Test Venue' })).toBeInTheDocument();
  });

  test('edits an existing event', async () => {
      render(<App />);

      // Wait for loading to finish
      await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

      // Add an event first
      const eventNameInput = screen.getByRole('textbox', { name: /event name:/i });
      const eventDateInput = screen.getByRole('textbox', { name: /date:/i });
      const eventVenueInput = screen.getByRole('textbox', { name: /venue:/i });

      fireEvent.change(eventNameInput, { target: { value: 'Original Event' } });
      fireEvent.change(eventDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(eventVenueInput, { target: { value: 'Original Venue' } });

      const addButton = screen.getByRole('button', { name: /^Add Event$/i });
      fireEvent.click(addButton);

      await waitFor(() => expect(screen.getByRole('cell', { name: 'Original Event' })).toBeInTheDocument());

      // Click the edit button for the added event
      const editButton = screen.getByRole('button', { name: /^Edit$/i });
      fireEvent.click(editButton);

      // Change the event details
      fireEvent.change(eventNameInput, { target: { value: 'Updated Event' } });
      fireEvent.change(eventDateInput, { target: { value: '2024-02-02' } });
      fireEvent.change(eventVenueInput, { target: { value: 'Updated Venue' } });

      const updateButton = screen.getByRole('button', { name: /^Update Event$/i });
      fireEvent.click(updateButton);

      // Assert that the event details are updated
      await waitFor(() => expect(screen.getByRole('cell', { name: 'Updated Event' })).toBeInTheDocument());
      expect(screen.getByRole('cell', { name: '2024-02-02' })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: 'Updated Venue' })).toBeInTheDocument();
  });

  test('deletes an event', async () => {
        render(<App />);

        // Wait for loading to finish
        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

        // Add an event first
        const eventNameInput = screen.getByRole('textbox', { name: /event name:/i });
        const eventDateInput = screen.getByRole('textbox', { name: /date:/i });
        const eventVenueInput = screen.getByRole('textbox', { name: /venue:/i });

        fireEvent.change(eventNameInput, { target: { value: 'Event to Delete' } });
        fireEvent.change(eventDateInput, { target: { value: '2024-01-01' } });
        fireEvent.change(eventVenueInput, { target: { value: 'Venue to Delete' } });

        const addButton = screen.getByRole('button', { name: /^Add Event$/i });
        fireEvent.click(addButton);

        await waitFor(() => expect(screen.getByRole('cell', { name: 'Event to Delete' })).toBeInTheDocument());

        // Delete the event
        const deleteButton = screen.getByRole('button', { name: /^Delete$/i });
        fireEvent.click(deleteButton);

        // Assert that the event is deleted
        await waitFor(() => expect(screen.queryByRole('cell', { name: 'Event to Delete' })).not.toBeInTheDocument());
    });

    test('filters events based on search term', async () => {
        render(<App />);

        // Wait for loading to finish
        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

        // Add two events
        const eventNameInput = screen.getByRole('textbox', { name: /event name:/i });
        const eventDateInput = screen.getByRole('textbox', { name: /date:/i });
        const eventVenueInput = screen.getByRole('textbox', { name: /venue:/i });

        fireEvent.change(eventNameInput, { target: { value: 'Event One' } });
        fireEvent.change(eventDateInput, { target: { value: '2024-01-01' } });
        fireEvent.change(eventVenueInput, { target: { value: 'Venue One' } });
        const addButton = screen.getByRole('button', { name: /^Add Event$/i });
        fireEvent.click(addButton);

        fireEvent.change(eventNameInput, { target: { value: 'Event Two' } });
        fireEvent.change(eventDateInput, { target: { value: '2024-02-02' } });
        fireEvent.change(eventVenueInput, { target: { value: 'Venue Two' } });
        fireEvent.click(addButton);

        await waitFor(() => expect(screen.getByRole('cell', { name: 'Event One' })).toBeInTheDocument());
        await waitFor(() => expect(screen.getByRole('cell', { name: 'Event Two' })).toBeInTheDocument());

        // Search for 'One'
        const searchInput = screen.getByPlaceholderText(/search for events.../i);
        fireEvent.change(searchInput, { target: { value: 'One' } });

        // Assert that only 'Event One' is visible
        await waitFor(() => expect(screen.getByRole('cell', { name: 'Event One' })).toBeInTheDocument());
        expect(screen.queryByRole('cell', { name: 'Event Two' })).not.toBeInTheDocument();
    });

    test('changes event status', async () => {
      render(<App />);

      // Wait for loading to finish
      await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

      // Add an event first
      const eventNameInput = screen.getByRole('textbox', { name: /event name:/i });
      const eventDateInput = screen.getByRole('textbox', { name: /date:/i });
      const eventVenueInput = screen.getByRole('textbox', { name: /venue:/i });

      fireEvent.change(eventNameInput, { target: { value: 'Status Event' } });
      fireEvent.change(eventDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(eventVenueInput, { target: { value: 'Status Venue' } });

      const addButton = screen.getByRole('button', { name: /^Add Event$/i });
      fireEvent.click(addButton);

      await waitFor(() => expect(screen.getByRole('cell', { name: 'Status Event' })).toBeInTheDocument());

      // Change the status to 'Ongoing'
      const statusSelect = screen.getByRole('cell', {name: /eventActionsCell/i}).querySelector('select');
      if (!statusSelect) {
          throw new Error("Status select element not found");
      }
      fireEvent.change(statusSelect, { target: { value: 'Ongoing' } });

      // Assert that the status has changed to 'Ongoing'
      await waitFor(() => expect(screen.getByText('Ongoing')).toBeInTheDocument());
    });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';
import { format } from 'date-fns';




describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('Daily Calendar')).toBeInTheDocument();
  });

  test('adds a new event', async () => {
    render(<App />);
    const addEventButton = screen.getByRole('button', { name: /Add Event/i });
    fireEvent.click(addEventButton);

    const titleInput = screen.getByLabelText('Title');
    const dateInput = screen.getByLabelText('Date and Time');
    const saveButton = screen.getByRole('button', { name: /Save/i });

    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    fireEvent.change(dateInput, { target: { value: format(new Date(), "yyyy-MM-dd'T'HH:mm") } });
    fireEvent.click(saveButton);

    expect(await screen.findByText('Test Event')).toBeInTheDocument();
  });

  test('edits an existing event', async () => {
    // Arrange
    const initialEvents = [{
        id: '1',
        title: 'Initial Event',
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        type: 'meeting',
        description: 'Initial Description',
    }];

    localStorage.setItem('events', JSON.stringify(initialEvents));

    render(<App />);

    const editButton = await screen.findByRole('button', {name: /Edit/i})
    fireEvent.click(editButton);

    const titleInput = screen.getByLabelText('Title');
    const saveButton = screen.getByRole('button', { name: /Save/i });

    fireEvent.change(titleInput, { target: { value: 'Updated Event' } });
    fireEvent.click(saveButton);

    expect(await screen.findByText('Updated Event')).toBeInTheDocument();
    expect(screen.queryByText('Initial Event')).toBeNull();
  });

  test('deletes an event', async () => {
    // Arrange
      const initialEvents = [{
          id: '1',
          title: 'Event to Delete',
          date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          type: 'meeting',
          description: 'Description',
      }];

      localStorage.setItem('events', JSON.stringify(initialEvents));

    render(<App />);

    // Act
    const deleteButton = await screen.findByRole('button', {name: /Trash2/i});
    fireEvent.click(deleteButton);

    // Assert
    expect(screen.queryByText('Event to Delete')).toBeNull();
  });

  test('filters events based on search term', async () => {
    const initialEvents = [
        {
            id: '1',
            title: 'Meeting with John',
            date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            type: 'meeting',
            description: 'Discuss project details',
        },
        {
            id: '2',
            title: 'Task: Prepare Presentation',
            date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            type: 'task',
            description: 'Create slides for the presentation',
        },
    ];
    localStorage.setItem('events', JSON.stringify(initialEvents));

    render(<App />);

    const searchInput = screen.getByPlaceholderText('Search events...');
    fireEvent.change(searchInput, { target: { value: 'meeting' } });

    expect(await screen.findByText('Meeting with John')).toBeInTheDocument();
    expect(screen.queryByText('Task: Prepare Presentation')).toBeNull();
});

  test('toggles dark mode', () => {
    render(<App />);
    const toggleButton = screen.getByRole('switch', {name: /themeToggle/i})
    fireEvent.click(toggleButton);
    expect(localStorage.getItem('darkMode')).toBe('true');
    fireEvent.click(toggleButton);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });
});
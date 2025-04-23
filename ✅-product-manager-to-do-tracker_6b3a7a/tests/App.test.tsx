import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
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

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('renders ProToDos app title', () => {
    render(<App />);
    expect(screen.getByText('ProToDos')).toBeInTheDocument();
  });

  test('adds a new task', () => {
    render(<App />);

    // Open the add task modal
    const addTaskButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addTaskButton);

    // Fill in the task details
    const titleInput = screen.getByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });

    const descriptionInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    // Save the task
    const createTaskButton = screen.getByRole('button', { name: /Create Task/i });
    fireEvent.click(createTaskButton);

    // Verify that the task is added
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('edits an existing task', async () => {
    render(<App />);

    // Open the edit task modal for the first task
    const editTaskButton = screen.getAllByRole('button', { name: /Edit task/i })[0];
    fireEvent.click(editTaskButton);

    // Change the task title
    const titleInput = screen.getByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: 'Updated Task Title' } });

    // Save the changes
    const updateTaskButton = screen.getByRole('button', { name: /Update Task/i });
    fireEvent.click(updateTaskButton);

    // Verify that the task is updated
    expect(screen.getByText('Updated Task Title')).toBeInTheDocument();
  });

  test('deletes a task', () => {
    render(<App />);

    // Delete the first task
    const deleteTaskButton = screen.getAllByRole('button', { name: /Delete task/i })[0];
    fireEvent.click(deleteTaskButton);

    // Verify that the task is deleted (check if the title is no longer present)
    // Implementation Note: This might require adjustments based on how you verify deletion

  });

  test('toggles task status', () => {
    render(<App />);

    // Toggle the status of the first task
    const toggleStatusButton = screen.getAllByRole('button', { name: /Mark task as/i })[0];
    fireEvent.click(toggleStatusButton);

    // Verify that the status has changed (this requires checking the UI for the updated status)
    // Implementation Note: This will require more specific checks based on the UI update
  });

  test('filters tasks by search query', async () => {
      render(<App />);

      const searchInput = screen.getByPlaceholderText(/Search tasks.../i);
      fireEvent.change(searchInput, { target: { value: 'market research' } });

      // Wait for the UI to update based on the filter (adjust timeout as needed)
      await screen.findByText('Complete market research for new feature');

      // Assert that the filtered task is displayed
      expect(screen.getByText('Complete market research for new feature')).toBeVisible();

  });

  test('opens and closes the filter dropdown', () => {
    render(<App />);

    const filterButton = screen.getByRole('button', { name: /Filters/i });
    fireEvent.click(filterButton);

    expect(screen.getByRole('option', { name: /All Priorities/i })).toBeVisible();

    fireEvent.click(filterButton);
    //expect(screen.queryByRole('option', { name: /All Priorities/i })).not.toBeInTheDocument();
  });

  test('switches between dark and light mode', () => {
    render(<App />);

    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });

    fireEvent.click(darkModeButton);

  });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
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
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/TaskMaster/i)).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    render(<App />);

    // Open the add task modal
    const addTaskButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addTaskButton);

    // Fill in the task details
    const titleInput = screen.getByLabelText(/Task Title/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    const dueDateInput = screen.getByLabelText(/Due Date/i) as HTMLInputElement;

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(dueDateInput, { target: { value: '2024-12-31' } });

    // Save the task
    const createTaskButton = screen.getByRole('button', { name: /Create Task/i });
    fireEvent.click(createTaskButton);

    // Check if the task is added
    expect(await screen.findByText(/Test Task/i)).toBeInTheDocument();
  });

  test('deletes a task', async () => {
    // Arrange
    render(<App />);
    const initialTaskTitle = screen.getByText(/Complete market research for new feature/i);
    expect(initialTaskTitle).toBeInTheDocument();

    // Act
    const deleteTaskButton = screen.getAllByLabelText(/Delete task/i)[0]; // Assuming the first task
    fireEvent.click(deleteTaskButton);

    // Assert
    expect(screen.queryByText(/Complete market research for new feature/i)).toBeNull();
  });

    test('toggles dark mode', () => {
    render(<App />);

    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeButton);

    expect(localStorageMock.getItem('darkMode')).toBe('true');
  });

    test('filters tasks by search query', async () => {
      render(<App />);

      // Switch to list view
      const taskListButton = screen.getByRole('button', { name: /Task List/i });
      fireEvent.click(taskListButton);

      // Search for a task
      const searchInput = screen.getByPlaceholderText(/Search tasks.../i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'market research' } });

      // Check if the task is displayed
      expect(await screen.findByText(/Complete market research for new feature/i)).toBeInTheDocument();

      // Clear the search query
      fireEvent.change(searchInput, { target: { value: '' } });

    });

    test('opens and closes the add task modal', () => {
      render(<App />);

      // Open the add task modal
      const addTaskButton = screen.getByRole('button', { name: /Add New Task/i });
      fireEvent.click(addTaskButton);

      expect(screen.getByRole('heading', { name: /Add New Task/i })).toBeInTheDocument();

      // Close the modal
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      // Ensure the modal is closed
      expect(screen.queryByRole('heading', { name: /Add New Task/i })).not.toBeInTheDocument();
    });
});
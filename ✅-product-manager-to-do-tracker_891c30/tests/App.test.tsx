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
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
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
    localStorage.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('displays the app title', () => {
    render(<App />);
    expect(screen.getByText(/PM Task Tracker/i)).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    render(<App />);

    // Open the add task modal
    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    // Fill in the task details
    const titleInput = screen.getByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });

    const descriptionInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    // Save the task
    const createTaskButton = screen.getByRole('button', { name: /Create Task/i });
    fireEvent.click(createTaskButton);

    // Check if the task is added to the list
    expect(screen.getByText(/Test Task/i)).toBeInTheDocument();
  });

  test('filters tasks by title', async () => {
    render(<App />);

    // Add a task
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
    fireEvent.change(screen.getByLabelText(/Task Title/i), { target: { value: 'Filtered Task' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'This should be filtered' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));

    // Filter the tasks
    const searchInput = screen.getByPlaceholderText(/Search tasks by title or description/i);
    fireEvent.change(searchInput, { target: { value: 'Filtered' } });

    // Check if the task is displayed
    expect(screen.getByText(/Filtered Task/i)).toBeInTheDocument();

    // Clear the filter
    fireEvent.change(searchInput, { target: { value: '' } });

  });

  test('opens and closes the filter dropdown', () => {
    render(<App />);
    const filterButton = screen.getByRole('button', { name: /Filters & Sort/i });
    fireEvent.click(filterButton);
    expect(screen.getByText(/Priority/i)).toBeVisible();

    fireEvent.click(filterButton);

  });

  test('sorts tasks by due date', async () => {
      render(<App />);
      const filterButton = screen.getByRole('button', { name: /Filters & Sort/i });
      fireEvent.click(filterButton);

      const sortBySelect = screen.getByLabelText(/Sort By/i);

  });

 test('toggles dark mode', () => {
    render(<App />);
    const themeToggleButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(themeToggleButton);

    // Check if dark mode is applied (e.g., by checking a dark background color)
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Toggle back to light mode
    fireEvent.click(themeToggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('displays no tasks message when there are no tasks', () => {
      localStorage.setItem('productManagerTasks', JSON.stringify([]));
      render(<App />);
      expect(screen.getByText(/No tasks found/i)).toBeInTheDocument();
  });

});
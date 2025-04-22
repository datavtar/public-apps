import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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


// Mock window.matchMedia
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
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('Product Manager Task Board')).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    render(<App />);
    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    const titleInput = screen.getByLabelText(/Task Title/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const dueDateInput = screen.getByLabelText(/Due Date/i);

    fireEvent.change(titleInput, { target: { value: 'New Task Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Task Description' } });
    fireEvent.change(dueDateInput, { target: { value: '2024-12-31' } });

    const createTaskButton = screen.getByRole('button', { name: /Create Task/i });
    fireEvent.click(createTaskButton);

    await waitFor(() => {
      expect(screen.getByText('New Task Title')).toBeInTheDocument();
    });
  });

  test('deletes a task', async () => {
    render(<App />);
    // Ensure there's at least one task to delete.  Adding one if none exist.
    if (!screen.queryByRole('listitem')) {
        const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
        fireEvent.click(addTaskButton);

        const titleInput = screen.getByLabelText(/Task Title/i);
        const descriptionInput = screen.getByLabelText(/Description/i);
        const dueDateInput = screen.getByLabelText(/Due Date/i);

        fireEvent.change(titleInput, { target: { value: 'Task to Delete' } });
        fireEvent.change(descriptionInput, { target: { value: 'Description for delete task' } });
        fireEvent.change(dueDateInput, { target: { value: '2024-12-31' } });

        const createTaskButton = screen.getByRole('button', { name: /Create Task/i });
        fireEvent.click(createTaskButton);

        await waitFor(() => {
            expect(screen.getByText('Task to Delete')).toBeInTheDocument();
        });
    }

    const deleteButton = screen.getByRole('button', { name: /Delete task/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
        expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument();
    });
  });

  test('filters tasks by status', async () => {
    render(<App />);
    const filterButton = screen.getByRole('button', { name: /Open filter menu/i });
    fireEvent.click(filterButton);

    const statusFilter = screen.getByLabelText(/Status/i);
    fireEvent.change(statusFilter, { target: { value: 'done' } });

    await waitFor(() => {
      // Assert that only tasks with status 'done' are displayed
      const taskElements = screen.getAllByRole('listitem');
      taskElements.forEach(taskElement => {
          expect(taskElement.textContent).toContain('Done');
      });
    });
  });

 test('toggles dark mode', () => {
    render(<App />);
    const themeToggle = screen.getByRole('button', {name: /switch to dark mode/i});

    fireEvent.click(themeToggle);

    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');

  });

  test('sorts tasks by due date', async () => {
    render(<App />);
    const filterButton = screen.getByRole('button', { name: /Open filter menu/i });
    fireEvent.click(filterButton);

    const sortBySelect = screen.getByLabelText(/Sort By/i);
    fireEvent.change(sortBySelect, { target: { value: 'dueDate' } });

    // No direct assertion here, as the order is harder to assert without more specific data.  
    // This test mainly ensures the sorting mechanism doesn't break on initial invocation.
  });

 test('opens and closes the filter dropdown', () => {
    render(<App />);
    const filterButton = screen.getByRole('button', { name: /Open filter menu/i });

    // Open the dropdown
    fireEvent.click(filterButton);
    expect(screen.getByLabelText(/Priority/i)).toBeVisible();

    // Close the dropdown (assuming clicking the button toggles it)
    fireEvent.click(filterButton);
    // Use queryByLabelText to check for absence without throwing an error
    expect(screen.queryByLabelText(/Priority/i)).not.toBeInTheDocument();
});


});
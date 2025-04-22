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
    localStorageMock.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('✅ Product Manager Task Board')).toBeInTheDocument();
  });

  test('opens and closes the add task modal', async () => {
    render(<App />);

    // Open the modal
    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Task')).toBeInTheDocument();
    });

    // Close the modal
    const closeModalButton = screen.getByRole('button', { name: /Close modal/i });
    fireEvent.click(closeModalButton);

    await waitFor(() => {
      expect(screen.queryByText('Add New Task')).not.toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    render(<App />);

    // Open the modal
    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    await waitFor(() => {
        expect(screen.getByText('Add New Task')).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Task Title/i), { target: { value: 'Test Task' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Description' } });

    // Save the task
    const createTaskButton = screen.getByRole('button', { name: /Create Task/i });
    fireEvent.click(createTaskButton);

    // Check if the task is added
    await waitFor(() => {
        expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  test('filters tasks by status', async () => {
    render(<App />);

    // Open the filter dropdown
    const filterButton = screen.getByRole('button', { name: /Filters/i });
    fireEvent.click(filterButton);

    // Select a status filter
    const statusFilter = screen.getByLabelText(/Status/i);
    fireEvent.change(statusFilter, { target: { value: 'done' } });

    // Wait for the filter to apply
    await waitFor(() => {
      // Check if the filter is applied (adjust expectation based on initial tasks)
      const taskElements = screen.getAllByRole('listitem');
      const allDone = taskElements.every(task => task.textContent?.includes('Done'));
      
      if (taskElements.length > 0) {
          expect(allDone).toBe(true);
      }
    });
  });

    test('shows analytics section when the button is clicked', async () => {
        render(<App />);

        const analyticsButton = screen.getByRole('button', { name: /Task Analytics/i });
        fireEvent.click(analyticsButton);

        await waitFor(() => {
            expect(screen.getByText('Total Tasks')).toBeInTheDocument();
        });
    });



  test('toggles dark mode', async () => {
    render(<App />);

    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });

    // Initial check for light mode
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Toggle to dark mode
    fireEvent.click(darkModeButton);
    await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    // Toggle back to light mode
    const lightModeButton = screen.getByRole('button', { name: /Switch to light mode/i });
    fireEvent.click(lightModeButton);

    await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});
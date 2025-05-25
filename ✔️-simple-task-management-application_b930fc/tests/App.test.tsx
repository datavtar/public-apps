import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = String(value);
    },
    clear: (): void => {
      store = {};
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.confirm
const originalConfirm = window.confirm;

beforeEach(() => {
  window.confirm = jest.fn(() => true); // Always confirm
  localStorage.clear();
});

afterEach(() => {
  window.confirm = originalConfirm;
});



test('renders the app', () => {
  render(<App />);
  expect(screen.getByText(/My Smart To-Do/i)).toBeInTheDocument();
});

test('adds a new todo', async () => {
  render(<App />);
  const addButton = screen.getByRole('button', { name: /Add Task/i });
  fireEvent.click(addButton);

  const taskInput = screen.getByLabelText(/Task Description/i);
  fireEvent.change(taskInput, { target: { value: 'Test Todo' } });

  const addModalButton = screen.getByRole('button', { name: /Add Task/i, hidden: false });
  fireEvent.click(addModalButton);

  await waitFor(() => {
    expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
  });
});

test('toggles theme', () => {
  render(<App />);
  const themeToggleButton = screen.getByRole('button', {ariaLabel: /Switch to dark mode/i});
  fireEvent.click(themeToggleButton);
  expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
  fireEvent.click(themeToggleButton);
  expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'false');
});

test('filters todos', async () => {
  render(<App />);

  // Add two todos, one completed and one active
  fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
  fireEvent.change(screen.getByLabelText(/Task Description/i), { target: { value: 'Active Todo' } });
  fireEvent.click(screen.getByRole('button', { name: /Add Task/i, hidden: false }));

  fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
  fireEvent.change(screen.getByLabelText(/Task Description/i), { target: { value: 'Completed Todo' } });
  fireEvent.click(screen.getByRole('button', { name: /Add Task/i, hidden: false }));


  await waitFor(() => {
    expect(screen.getByText(/Active Todo/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed Todo/i)).toBeInTheDocument();
  });

  // Mark the 'Completed Todo' as complete
  const checkbox = screen.getByLabelText(/Completed Todo/i).closest('div')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
  fireEvent.click(checkbox);

  // Filter by 'Completed'
  fireEvent.change(screen.getByLabelText(/Filter By/i), { target: { value: 'completed' } });

  await waitFor(() => {
    expect(screen.getByText(/Completed Todo/i)).toBeInTheDocument();
    expect(() => screen.getByText(/Active Todo/i)).toThrow(); // Not present
  });
});

test('deletes a todo', async () => {
  render(<App />);

  // Add a todo
  fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
  fireEvent.change(screen.getByLabelText(/Task Description/i), { target: { value: 'Todo to Delete' } });
  fireEvent.click(screen.getByRole('button', { name: /Add Task/i, hidden: false }));

  await waitFor(() => {
    expect(screen.getByText(/Todo to Delete/i)).toBeInTheDocument();
  });

  // Delete the todo
  fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

  await waitFor(() => {
    expect(() => screen.getByText(/Todo to Delete/i)).toThrow();
  });
});

test('edits a todo', async () => {
    render(<App />);

    // Add a todo
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
    fireEvent.change(screen.getByLabelText(/Task Description/i), { target: { value: 'Todo to Edit' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i, hidden: false }));

    await waitFor(() => {
        expect(screen.getByText(/Todo to Edit/i)).toBeInTheDocument();
    });

    // Edit the todo
    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));

    const taskInput = screen.getByLabelText(/Task Description/i);
    fireEvent.change(taskInput, { target: { value: 'Edited Todo' } });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
        expect(screen.getByText(/Edited Todo/i)).toBeInTheDocument();
        expect(() => screen.getByText(/Todo to Edit/i)).toThrow();
    });
});
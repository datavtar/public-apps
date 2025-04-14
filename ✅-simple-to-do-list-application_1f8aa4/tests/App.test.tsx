import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock crypto.randomUUID
const mockUUID = 'test-uuid';

global.crypto.randomUUID = jest.fn(() => mockUUID);


beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

test('renders the app', () => {
  render(<App />);
  expect(screen.getByText(/Simple To-Do List/i)).toBeInTheDocument();
});

test('adds a new task', async () => {
  render(<App />);
  const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
  const addButton = screen.getByRole('button', { name: /Add Task/i });

  fireEvent.change(inputElement, { target: { value: 'New Task' } });
  fireEvent.click(addButton);

  await waitFor(() => {
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });
});

test('toggles a task as completed', async () => {
  render(<App />);
  const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
  const addButton = screen.getByRole('button', { name: /Add Task/i });

  fireEvent.change(inputElement, { target: { value: 'Task to Complete' } });
  fireEvent.click(addButton);

  await waitFor(() => {
    expect(screen.getByText('Task to Complete')).toBeInTheDocument();
  });

  const checkbox = screen.getByRole('checkbox', {name: 'Task to Complete'}) as HTMLInputElement

  fireEvent.click(checkbox);

  await waitFor(() => {
    expect(checkbox.checked).toBe(true)
  })
});

test('deletes a task', async () => {
  render(<App />);
  const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
  const addButton = screen.getByRole('button', { name: /Add Task/i });

  fireEvent.change(inputElement, { target: { value: 'Task to Delete' } });
  fireEvent.click(addButton);

  let deleteTaskButton: HTMLElement

  await waitFor(() => {
    deleteTaskButton = screen.getByRole('button', {name: /Delete task: Task to Delete/i})
  });

  fireEvent.click(deleteTaskButton)

  await waitFor(() => {
    expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument();
  });
});

test('filters tasks', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Active Task' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Completed Task' } });
    fireEvent.click(addButton);

    const activeFilter = screen.getByRole('combobox', {name: /Filter tasks/i})

    fireEvent.change(activeFilter, {target: {value: 'active'}})

    await waitFor(() => {
      expect(screen.getByText('Active Task')).toBeInTheDocument()
      expect(screen.queryByText('Completed Task')).not.toBeInTheDocument()
    })
});

test('edits a task', async () => {
  render(<App />);
  const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
  const addButton = screen.getByRole('button', { name: /Add Task/i });

  fireEvent.change(inputElement, { target: { value: 'Task to Edit' } });
  fireEvent.click(addButton);

  let editButton: HTMLElement

  await waitFor(() => {
    editButton = screen.getByRole('button', {name: /Edit task: Task to Edit/i})
  });

  fireEvent.click(editButton)

  const editTaskInput = screen.getByLabelText(/Edit task input/i) as HTMLInputElement;
  fireEvent.change(editTaskInput, {target: {value: 'Edited Task'}})

  const saveChangesButton = screen.getByRole('button', {name: /Save Changes/i})
  fireEvent.click(saveChangesButton)

  await waitFor(() => {
    expect(screen.getByText('Edited Task')).toBeInTheDocument()
    expect(screen.queryByText('Task to Edit')).not.toBeInTheDocument()
  })
});

test('sorts tasks', async () => {
  render(<App />);
  const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
  const addButton = screen.getByRole('button', { name: /Add Task/i });

  fireEvent.change(inputElement, { target: { value: 'Task 1' } });
  fireEvent.click(addButton);
  fireEvent.change(inputElement, { target: { value: 'Task 2' } });
  fireEvent.click(addButton);

  const sortButton = screen.getByRole('button', {name: /Sort by Date/i})
  fireEvent.click(sortButton)
});

test('persists tasks to localStorage', async () => {
  render(<App />);
  const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
  const addButton = screen.getByRole('button', { name: /Add Task/i });

  fireEvent.change(inputElement, { target: { value: 'Task to Persist' } });
  fireEvent.click(addButton);

  await waitFor(() => {
    expect(localStorage.setItem).toHaveBeenCalledWith("tasks", expect.any(String));
  });
});

test('loads tasks from localStorage', () => {
    localStorage.setItem('tasks', JSON.stringify([{ id: '1', text: 'Loaded Task', completed: false, createdAt: Date.now() }]));
    render(<App />);
    expect(screen.getByText('Loaded Task')).toBeInTheDocument();
});

test('toggles theme', async () => {
  render(<App />);
  const themeButton = screen.getByRole('button', { name: /Switch to dark mode/i });

  fireEvent.click(themeButton);

  await waitFor(() => {
    expect(localStorage.setItem).toHaveBeenCalledWith("darkMode", 'true');
  });

  fireEvent.click(themeButton);

  await waitFor(() => {
    expect(localStorage.setItem).toHaveBeenCalledWith("darkMode", 'false');
  });
});

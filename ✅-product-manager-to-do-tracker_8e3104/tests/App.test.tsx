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

// Mock matchMedia for dark mode preference
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/PM Task Board/i)).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

    await waitFor(() => expect(screen.getByLabelText(/Task Title/i)).toBeVisible());

    fireEvent.change(screen.getByLabelText(/Task Title/i), { target: { value: 'New Task Title' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Task Description' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));

    await waitFor(() => expect(screen.getByText(/New Task Title/i)).toBeInTheDocument());
  });

  test('deletes a task', async () => {
    render(<App />);
    const initialTaskTitle = screen.getByText(/Complete market research for new feature/i)
    expect(initialTaskTitle).toBeVisible();
    const deleteTaskButton = screen.getAllByRole('button', {name: /Delete task/i})[0];
    fireEvent.click(deleteTaskButton);
    await waitFor(() => expect(screen.queryByText(/Complete market research for new feature/i)).not.toBeInTheDocument());
  });

  test('opens and closes the filter dropdown', async () => {
    render(<App />);
    const filterButton = screen.getByRole('button', { name: /Open filter menu/i });

    fireEvent.click(filterButton);
    await waitFor(() => expect(screen.getByText(/Priority/i)).toBeVisible());

    fireEvent.click(filterButton);
    await waitFor(() => expect(screen.queryByText(/Priority/i)).not.toBeInTheDocument());
  });

  test('filters tasks by priority', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Open filter menu/i }));
    await waitFor(() => expect(screen.getByText(/Priority/i)).toBeVisible());

    fireEvent.change(screen.getByLabelText(/Priority/i), { target: { value: 'high' } });

    await waitFor(() => {
      expect(screen.getByText(/Complete market research for new feature/i)).toBeVisible();
      expect(screen.queryByText(/Prepare presentation for stakeholders/i)).not.toBeInTheDocument();
    });
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i});
    expect(darkModeButton).toBeInTheDocument();
    fireEvent.click(darkModeButton);
    expect(localStorageMock.getItem('darkMode')).toBe('true');

    fireEvent.click(darkModeButton);
    expect(localStorageMock.getItem('darkMode')).toBe('false');
  });

  test('edits a task', async () => {
    render(<App />);
    const editTaskButton = screen.getAllByRole('button', { name: /Edit task/i })[0];
    expect(editTaskButton).toBeVisible();

    fireEvent.click(editTaskButton);

    await waitFor(() => expect(screen.getByLabelText(/Task Title/i)).toBeVisible());
    fireEvent.change(screen.getByLabelText(/Task Title/i), { target: { value: 'Updated Task Title' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Task/i }));

    await waitFor(() => expect(screen.getByText(/Updated Task Title/i)).toBeInTheDocument());
  });

  test('displays no tasks message when there are no tasks', () => {
    localStorageMock.setItem('productManagerTasks', JSON.stringify([]));
    render(<App />);
    expect(screen.getByText(/No tasks found/i)).toBeInTheDocument();
  });
});
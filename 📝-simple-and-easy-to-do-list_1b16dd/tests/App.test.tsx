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


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders without crashing', () => {
    render(<App />);
  });

  it('displays "No tasks yet" message when there are no tasks', () => {
    render(<App />);
    expect(screen.getByText('No tasks yet. Add a task to get started!')).toBeInTheDocument();
  });

  it('adds a new task', async () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /new task text/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Buy groceries' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });
  });

  it('toggles a task completion status', async () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /new task text/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Walk the dog' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', {name: /Mark task complete/i});
      fireEvent.click(checkbox);

      expect(checkbox).toBeChecked();
    });
  });

  it('deletes a task', async () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /new task text/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Pay bills' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', {name: /Delete task/i});
      fireEvent.click(deleteButton);

      expect(screen.queryByText('Pay bills')).not.toBeInTheDocument();
    });
  });

  it('edits a task', async () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /new task text/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Read a book' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const editButton = screen.getByRole('button', {name: /Edit task/i});
      fireEvent.click(editButton);

      const editInputElement = screen.getByRole('textbox', {name: /Edit task text/i});
      fireEvent.change(editInputElement, { target: { value: 'Read new book' } });

      const saveButton = screen.getByRole('button', {name: /Save edits/i});
      fireEvent.click(saveButton);

      expect(screen.getByText('Read new book')).toBeInTheDocument();
    });
  });

  it('cancels editing a task', async () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /new task text/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Learn React' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const editButton = screen.getByRole('button', {name: /Edit task/i});
      fireEvent.click(editButton);

      const cancelButton = screen.getByRole('button', {name: /Cancel editing/i});
      fireEvent.click(cancelButton);

      expect(screen.getByText('Learn React')).toBeInTheDocument();
    });
  });

  it('saves tasks to localStorage', async () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /new task text/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Task 1' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(localStorageMock.getItem('tasks')).toEqual(JSON.stringify([{ id: expect.any(String), text: 'Task 1', completed: false, createdAt: expect.any(String) }]));
    });
  });

  it('loads tasks from localStorage on mount', async () => {
    localStorageMock.setItem('tasks', JSON.stringify([{ id: '1', text: 'Task from storage', completed: false, createdAt: new Date().toISOString() }]));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Task from storage')).toBeInTheDocument();
    });
  });
});
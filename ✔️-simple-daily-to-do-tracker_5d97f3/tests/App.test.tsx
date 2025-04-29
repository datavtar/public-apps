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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Simple Todo App')).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'New Task' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  test('toggles task completion', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Task to Complete' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const completeButton = screen.getByRole('button', { name: /mark as complete/i });
      fireEvent.click(completeButton);

      expect(screen.getByText('Task to Complete')).toHaveClass('line-through');
    });
  });

  test('removes a task', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Task to Remove' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const removeButton = screen.getByRole('button', { name: /delete task/i });
      fireEvent.click(removeButton);

      expect(screen.queryByText('Task to Remove')).not.toBeInTheDocument();
    });
  });

  test('edits a task', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Task to Edit' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit task/i });
      fireEvent.click(editButton);

      const editInputElement = screen.getByRole('textbox', { name: /edit task/i });
      fireEvent.change(editInputElement, { target: { value: 'Edited Task' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      expect(screen.getByText('Edited Task')).toBeInTheDocument();
      expect(screen.queryByRole('textbox', {name: /edit task/i})).not.toBeInTheDocument();

    });
  });

    test('displays no tasks message when there are no tasks', () => {
    render(<App />);
    expect(screen.getByText('No tasks yet. Add one above!')).toBeInTheDocument();
  });

  test('persists tasks in localStorage', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Persisted Task' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(localStorage.getItem('tasks')).toContain('Persisted Task');
    });
  });

    test('toggles dark mode', async () => {
        render(<App />);
        const darkModeButton = screen.getByRole('button', { name: /switch to dark mode|switch to light mode/i });

        fireEvent.click(darkModeButton);

        await waitFor(() => {
            expect(document.documentElement.classList.contains('dark')).toBe(true);
        });

        fireEvent.click(darkModeButton);

        await waitFor(() => {
            expect(document.documentElement.classList.contains('dark')).toBe(false);
        });
    });

});
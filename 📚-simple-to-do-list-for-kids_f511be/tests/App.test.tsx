import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock local storage
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

beforeEach(() => {
  localStorageMock.clear();
});

describe('App Component', () => {
  test('renders the app', () => {
    render(<App />);
    expect(screen.getByText('✨ My Fun To-Do! ✨')).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Buy milk' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Buy milk')).toBeInTheDocument();
    });
  });

  test('toggles a task as complete', async () => {
    render(<App />);

    // Assuming the initial task '🎨 Draw a colorful rainbow' exists
    const toggleButton = await screen.findByLabelText('Mark as complete');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Mark as incomplete')).toBeInTheDocument();
    });
  });

  test('deletes a task', async () => {
    render(<App />);

    // Assuming the initial task '🎨 Draw a colorful rainbow' exists
    const deleteButton = await screen.findByLabelText(/delete task: 🎨 Draw a colorful rainbow/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('🎨 Draw a colorful rainbow')).not.toBeInTheDocument();
    });
  });

  test('toggles dark mode', async () => {
      render(<App />);
      const themeToggleButton = screen.getByRole('button', { name: /switch to dark mode/i });

      fireEvent.click(themeToggleButton);

      await waitFor(() => {
          expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
      });

      fireEvent.click(themeToggleButton);

       await waitFor(() => {
          expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
      });
  });

  test('displays no tasks message when there are no tasks', () => {
    localStorageMock.setItem('kiddoToDoApp_tasks', JSON.stringify([]));
    render(<App />);
    expect(screen.getByText('No tasks yet! Hooray!')).toBeInTheDocument();
  });

  test('loads tasks from local storage', async () => {
    const mockTasks = [
      { id: '1', text: 'Walk the dog', completed: false, createdAt: Date.now() },
    ];
    localStorageMock.setItem('kiddoToDoApp_tasks', JSON.stringify(mockTasks));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Walk the dog')).toBeInTheDocument();
    });
  });

  test('loads dark mode preference from local storage', () => {
    localStorageMock.setItem('kiddoToDoApp_darkMode', 'true');
    render(<App />);
    expect(localStorageMock.getItem('kiddoToDoApp_darkMode')).toBe('true');
  });
});
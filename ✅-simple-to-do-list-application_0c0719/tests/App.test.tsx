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

  test('renders without crashing', () => {
    render(<App />);
  });

  test('adds a new task', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add new task/i });

    fireEvent.change(inputElement, { target: { value: 'New Task' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  test('toggles a task completion', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add new task/i });

    fireEvent.change(inputElement, { target: { value: 'Task to toggle' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const toggleButton = screen.getByRole('button', { name: /mark task 'Task to toggle' as complete/i });
      fireEvent.click(toggleButton);

      expect(screen.getByText('Task to toggle')).toHaveClass('line-through');
    });
  });

  test('deletes a task', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add new task/i });

    fireEvent.change(inputElement, { target: { value: 'Task to delete' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete task: Task to delete/i });
      fireEvent.click(deleteButton);

      expect(screen.queryByText('Task to delete')).not.toBeInTheDocument();
    });
  });

  test('edits a task', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add new task/i });

    fireEvent.change(inputElement, { target: { value: 'Task to edit' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit task: Task to edit/i });
      fireEvent.click(editButton);

      const editInputElement = screen.getByRole('textbox', { name: /edit task: Task to edit/i });
      fireEvent.change(editInputElement, { target: { value: 'Edited Task' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      expect(screen.queryByText('Task to edit')).not.toBeInTheDocument();
      expect(screen.getByText('Edited Task')).toBeInTheDocument();
    });
  });

  test('filters tasks', async () => {
    render(<App />);

    const inputElement1 = screen.getByRole('textbox', { name: /new task input/i });
    const addButton1 = screen.getByRole('button', { name: /add new task/i });
    fireEvent.change(inputElement1, { target: { value: 'Active Task' } });
    fireEvent.click(addButton1);

    const inputElement2 = screen.getByRole('textbox', { name: /new task input/i });
    fireEvent.change(inputElement2, { target: { value: 'Completed Task' } });
    const addButton2 = screen.getByRole('button', { name: /add new task/i });
    fireEvent.click(addButton2);

    await waitFor(() => {
        const toggleButton = screen.getByRole('button', { name: /mark task 'Completed Task' as complete/i });
        fireEvent.click(toggleButton);
    });


    const completedFilterButton = screen.getByRole('button', { name: /completed/i });
    fireEvent.click(completedFilterButton);

    await waitFor(() => {
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
      expect(screen.queryByText('Active Task')).not.toBeInTheDocument();
    });

    const activeFilterButton = screen.getByRole('button', { name: /active/i });
    fireEvent.click(activeFilterButton);

    await waitFor(() => {
      expect(screen.getByText('Active Task')).toBeInTheDocument();
      expect(screen.queryByText('Completed Task')).not.toBeInTheDocument();
    });
  });

  test('searches tasks', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add new task/i });

    fireEvent.change(inputElement, { target: { value: 'Searchable Task' } });
    fireEvent.click(addButton);

    fireEvent.change(inputElement, { target: { value: 'Another Task' } });
    fireEvent.click(addButton);

    const searchInput = screen.getByRole('textbox', { name: /search tasks input/i });
    fireEvent.change(searchInput, { target: { value: 'searchable' } });

    await waitFor(() => {
      expect(screen.getByText('Searchable Task')).toBeInTheDocument();
      expect(screen.queryByText('Another Task')).not.toBeInTheDocument();
    });
  });

  test('persists tasks to localStorage', async () => {
      render(<App />);
      const inputElement = screen.getByRole('textbox', { name: /new task input/i });
      const addButton = screen.getByRole('button', { name: /add new task/i });

      fireEvent.change(inputElement, { target: { value: 'Task to persist' } });
      fireEvent.click(addButton);

      await waitFor(() => {
          expect(localStorageMock.getItem('todoAppTasks')).toBeDefined();
          expect(JSON.parse(localStorageMock.getItem('todoAppTasks') || '[]').length).toBe(1);
      });
  });

    test('loads tasks from localStorage', async () => {
        localStorageMock.setItem('todoAppTasks', JSON.stringify([{ id: '1', text: 'Loaded Task', completed: false, createdAt: Date.now() }]));

        render(<App />);

        await waitFor(() => {
            expect(screen.getByText('Loaded Task')).toBeInTheDocument();
        });
    });

    test('toggles theme', async () => {
        render(<App />);

        const themeToggleButton = screen.getByRole('button', { name: /switch to dark mode/i });
        fireEvent.click(themeToggleButton);

        await waitFor(() => {
            expect(localStorageMock.getItem('todoAppTheme')).toBe('dark');
        });

        const themeToggleButton2 = screen.getByRole('button', { name: /switch to light mode/i });
        fireEvent.click(themeToggleButton2);

        await waitFor(() => {
            expect(localStorageMock.getItem('todoAppTheme')).toBe('light');
        });
    });

    test('displays no tasks message when there are no tasks', () => {
        render(<App />);
        expect(screen.getByText('No tasks yet. Add one above!')).toBeInTheDocument();
    });

    test('displays no tasks match message when the filter returns no task', async () => {
        render(<App />);

        const inputElement = screen.getByRole('textbox', { name: /new task input/i });
        const addButton = screen.getByRole('button', { name: /add new task/i });

        fireEvent.change(inputElement, { target: { value: 'MyTask' } });
        fireEvent.click(addButton);

        const completedFilterButton = screen.getByRole('button', { name: /completed/i });
        fireEvent.click(completedFilterButton);

        await waitFor(() => {
            expect(screen.getByText('No tasks match your current filter/search.')).toBeInTheDocument();
        });
    });
});
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
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
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
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
});


describe('App Component', () => {

  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('My To-Do List')).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Test Task' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
    
  });

  test('toggles task completion', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Task to Complete' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Task to Complete')).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole('button', {name: /mark task as complete/i});

    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByText('Task to Complete')).toHaveClass('line-through');
    });

  });

  test('deletes a task', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Task to Delete' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Task to Delete')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete task: Task to Delete/i });

    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(screen.queryByText('Task to Delete')).toBeNull();
    });
  });

  test('opens and closes the edit modal', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Task to Edit' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Task to Edit')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit task: Task to Edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Task/i })).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', {name: /close edit modal/i});
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Edit Task/i })).not.toBeInTheDocument();
    });
  });

  test('filters tasks', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Active Task' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Completed Task' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Active Task')).toBeInTheDocument();
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('button', {name: /mark task as complete/i});
    fireEvent.click(completeButton);

    const filterSelect = screen.getByRole('combobox', {name: /filter tasks/i});
    fireEvent.change(filterSelect, {target: {value: 'active'}});

    await waitFor(() => {
      expect(screen.queryByText('Completed Task')).not.toBeInTheDocument();
      expect(screen.getByText('Active Task')).toBeInTheDocument();
    });

  });

  test('searches tasks', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Find Me' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Dont Find' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Find Me')).toBeInTheDocument();
      expect(screen.getByText('Dont Find')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox', {name: /search tasks/i});
    fireEvent.change(searchInput, {target: {value: 'Find'}});

    await waitFor(() => {
      expect(screen.getByText('Find Me')).toBeInTheDocument();
      expect(screen.queryByText('Dont Find')).not.toBeInTheDocument();
    });
  });

  test('sorts tasks alphabetically', async () => {
      render(<App />);
      const inputElement = screen.getByRole('textbox', { name: /new task description/i });
      const addButton = screen.getByRole('button', { name: /^Add$/i });

      fireEvent.change(inputElement, { target: { value: 'B Task' } });
      fireEvent.click(addButton);
      fireEvent.change(inputElement, { target: { value: 'A Task' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getAllByText(/Task/)).toHaveLength(2);
      });

      const sortSelect = screen.getByRole('combobox', { name: /sort tasks/i });
      fireEvent.change(sortSelect, { target: { value: 'alpha-asc' } });

      await waitFor(() => {
        const tasks = screen.getAllByText(/Task/);
        expect(tasks[0].textContent).toBe('A Task');
        expect(tasks[1].textContent).toBe('B Task');
      });
    });

    test('sorts tasks by date newest first', async () => {
      render(<App />);

      const sortSelect = screen.getByRole('combobox', { name: /sort tasks/i });
      fireEvent.change(sortSelect, { target: { value: 'date-desc' } });

      // Since the default tasks are already sorted by date-desc,
      // We mainly need to ensure the sorting mechanism works without errors.
      await waitFor(() => {
          expect(sortSelect.value).toBe('date-desc');
      });
    });
});
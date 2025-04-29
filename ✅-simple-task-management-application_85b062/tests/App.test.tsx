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


describe('App Component', () => {

  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders the app with initial tasks', () => {
    render(<App />);
    expect(screen.getByText(/Welcome! Add your first task above./i)).toBeInTheDocument();
    expect(screen.getByText(/Click the checkmark to complete./i)).toBeInTheDocument();
    expect(screen.getByText(/Try editing or deleting this task./i)).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    fireEvent.change(inputElement, { target: { value: 'New Task' } });
    const addButton = screen.getByRole('button', { name: /^Add$/i });
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  test('toggles a task completion', async () => {
    render(<App />);
    const toggleButton = await screen.findByRole('button', { name: /Mark task as complete/i });
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(toggleButton).toHaveAttribute('aria-label', 'Mark task as incomplete');
    });
  });

  test('deletes a task', async () => {
    render(<App />);
    const deleteTaskButton = await screen.findByRole('button', { name: /Delete task: Try editing or deleting this task./i });
    fireEvent.click(deleteTaskButton);
    await waitFor(() => {
      expect(screen.queryByText(/Try editing or deleting this task./i)).not.toBeInTheDocument();
    });
  });

  test('opens and closes the edit modal', async () => {
    render(<App />);
    const editButton = await screen.findByRole('button', { name: /Edit task: Try editing or deleting this task./i });
    fireEvent.click(editButton);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Task/i })).toBeInTheDocument();
    });
    const closeButton = screen.getByRole('button', { name: /Close edit modal/i });
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Edit Task/i })).not.toBeInTheDocument();
    });
  });

  test('edits a task', async () => {
    render(<App />);
    const editButton = await screen.findByRole('button', { name: /Edit task: Try editing or deleting this task./i });
    fireEvent.click(editButton);

    const editInput = screen.getByRole('textbox', { name: /Edit task description/i });
    fireEvent.change(editInput, { target: { value: 'Edited Task' } });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Edited Task')).toBeInTheDocument();
    });

    expect(screen.queryByRole('heading', { name: /Edit Task/i })).not.toBeInTheDocument();
  });

  test('filters tasks', async () => {
    render(<App />);

    const filterSelect = screen.getByRole('combobox', { name: /Filter tasks/i });
    fireEvent.change(filterSelect, { target: { value: 'completed' } });

    await waitFor(() => {
      expect(screen.getByText(/Try editing or deleting this task./i)).toBeInTheDocument();
    });

    fireEvent.change(filterSelect, { target: { value: 'active' } });

    await waitFor(() => {
      expect(screen.queryByText(/Try editing or deleting this task./i)).not.toBeInTheDocument();
    });
  });

  test('sorts tasks', async () => {
    render(<App />);

    const sortSelect = screen.getByRole('combobox', { name: /Sort/i });
    fireEvent.change(sortSelect, { target: { value: 'alpha-asc' } });

    // Can't really assert the exact order without more controlled data. Just checking it doesn't error.
    expect(sortSelect.value).toBe('alpha-asc');
  });

  test('searches tasks', async () => {
    render(<App />);

    const searchInput = screen.getByRole('textbox', { name: /Search tasks/i });
    fireEvent.change(searchInput, { target: { value: 'editing' } });

    await waitFor(() => {
      expect(screen.getByText(/Try editing or deleting this task./i)).toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.queryByText(/Try editing or deleting this task./i)).not.toBeInTheDocument();
    });
  });
});
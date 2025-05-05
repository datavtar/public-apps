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
    localStorage.clear();
  });

  test('renders basic elements', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Simple To-Do/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/What needs to be done?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Task/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Filter tasks/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Sort By/i })).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    render(<App />);
    const inputElement = screen.getByPlaceholderText(/What needs to be done?/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Buy groceries' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });
  });

  test('toggles task completion', async () => {
    render(<App />);
    const inputElement = screen.getByPlaceholderText(/What needs to be done?/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Walk the dog' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const toggleButton = screen.getByRole('button', { name: /Mark task 'Walk the dog' as completed/i });
      fireEvent.click(toggleButton);

      expect(screen.getByText('Walk the dog')).toHaveClass('line-through');
    });
  });

  test('deletes a task', async () => {
    render(<App />);
    const inputElement = screen.getByPlaceholderText(/What needs to be done?/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Clean the house' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /Delete task 'Clean the house'/i });
      fireEvent.click(deleteButton);
      expect(screen.queryByText('Clean the house')).not.toBeInTheDocument();
    });
  });

  test('filters tasks', async () => {
    render(<App />);
    const inputElement1 = screen.getByPlaceholderText(/What needs to be done?/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement1, { target: { value: 'Task 1' } });
    fireEvent.click(addButton);

    const inputElement2 = screen.getByPlaceholderText(/What needs to be done?/i) as HTMLInputElement;
    fireEvent.change(inputElement2, { target: { value: 'Task 2' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const toggleButton = screen.getByRole('button', { name: /Mark task 'Task 1' as completed/i });
      fireEvent.click(toggleButton);
    });

    const filterSelect = screen.getByRole('combobox', { name: /Filter tasks/i });
    fireEvent.change(filterSelect, { target: { value: 'active' } });

    await waitFor(() => {
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

    fireEvent.change(filterSelect, { target: { value: 'completed' } });

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    });

    fireEvent.change(filterSelect, { target: { value: 'all' } });

     await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
      });

  });

    test('edits a task', async () => {
        render(<App />);
        const inputElement = screen.getByPlaceholderText(/What needs to be done?/i) as HTMLInputElement;
        const addButton = screen.getByRole('button', { name: /Add Task/i });

        fireEvent.change(inputElement, { target: { value: 'Initial Task' } });
        fireEvent.click(addButton);

        await waitFor(() => {
            const editButton = screen.getByRole('button', { name: /Edit task 'Initial Task'/i });
            fireEvent.click(editButton);

            const editInput = screen.getByRole('textbox', { name: /Edit task: Initial Task/i }) as HTMLInputElement;
            fireEvent.change(editInput, { target: { value: 'Updated Task' } });

            const saveButton = screen.getByRole('button', { name: /Save changes/i });
            fireEvent.click(saveButton);

            expect(screen.getByText('Updated Task')).toBeInTheDocument();
            expect(screen.queryByText('Initial Task')).not.toBeInTheDocument();
        });
    });

  test('displays error message when task text is empty', async () => {
        render(<App />);
        const addButton = screen.getByRole('button', { name: /Add Task/i });

        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Task text cannot be empty.')).toBeInTheDocument();
        });
    });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('switch', {name: /theme-toggle/i});
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    fireEvent.click(darkModeButton);
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(darkModeButton);

    expect(document.documentElement.classList.contains('dark')).toBe(false);

  });

});
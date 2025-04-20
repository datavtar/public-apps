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

// Mock matchMedia
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
  })),
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Homemaker's Helper/i })).toBeInTheDocument();
  });

  test('adds a new todo', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Buy milk' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Buy milk')).toBeInTheDocument();
    });
  });

  test('toggles a todo as complete', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Walk the dog' } });
    fireEvent.click(addButton);

    await waitFor(() => {
        const toggleButton = screen.getByRole('button', {name: /Mark task as complete/i});
        fireEvent.click(toggleButton);
        expect(screen.getByRole('button', {name: /Mark task as active/i})).toBeInTheDocument();
    });
  });

  test('deletes a todo', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Do laundry' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /Delete task: Do laundry/i });
      fireEvent.click(deleteButton);
    });

    const confirmDeleteButton = screen.getByRole('button', { name: /Delete Task/i });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Do laundry')).not.toBeInTheDocument();
    });
  });

  test('filters todos', async () => {
    render(<App />);
    const inputElement1 = screen.getByLabelText(/New task input/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement1, { target: { value: 'Grocery Shopping' } });
    fireEvent.click(addButton);

    const inputElement2 = screen.getByLabelText(/New task input/i) as HTMLInputElement;
    fireEvent.change(inputElement2, { target: { value: 'Pay Bills' } });
    fireEvent.click(addButton);

    await waitFor(() => {
        const toggleButton = screen.getByRole('button', {name: /Mark task as complete/i});
        fireEvent.click(toggleButton);
    });

    const completedFilterButton = screen.getByRole('button', { name: /completed/i });
    fireEvent.click(completedFilterButton);

    await waitFor(() => {
      expect(screen.getByText('Grocery Shopping')).not.toBeInTheDocument();
      expect(screen.getByText('Pay Bills')).toBeInTheDocument();
    });

    const allFilterButton = screen.getByRole('button', { name: /all/i });
    fireEvent.click(allFilterButton);

    await waitFor(() => {
      expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
      expect(screen.getByText('Pay Bills')).toBeInTheDocument();
    });
  });

  test('searches todos', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Clean bathroom' } });
    fireEvent.click(addButton);

    const searchInput = screen.getByLabelText(/Search tasks input/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'bathroom' } });

    await waitFor(() => {
      expect(screen.getByText('Clean bathroom')).toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: 'kitchen' } });

    await waitFor(() => {
      expect(screen.queryByText('Clean bathroom')).not.toBeInTheDocument();
    });
  });

  test('edits a todo', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Water plants' } });
    fireEvent.click(addButton);

    await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /Edit task: Water plants/i });
        fireEvent.click(editButton);
    });

    const editInput = screen.getByLabelText(/Edit task description/i) as HTMLInputElement;
    fireEvent.change(editInput, { target: { value: 'Water all plants' } });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Water all plants')).toBeInTheDocument();
      expect(screen.queryByText('Water plants')).not.toBeInTheDocument();
    });
  });

  test('should toggle theme', async () => {
    render(<App />);
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(themeToggle);
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode_homemaker', 'true');
  });

  test('sorts todos by due date', async () => {
    render(<App />);

    const inputElement1 = screen.getByLabelText(/New task input/i) as HTMLInputElement;
    fireEvent.change(inputElement1, { target: { value: 'Task with due date' } });
    const dueDate1 = screen.getByLabelText(/New task due date/i) as HTMLInputElement;
    fireEvent.change(dueDate1, { target: { value: '2024-12-31' } });
    const addButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addButton);

    const inputElement2 = screen.getByLabelText(/New task input/i) as HTMLInputElement;
    fireEvent.change(inputElement2, { target: { value: 'Task without due date' } });
    fireEvent.click(addButton);

    const sortByDueDate = screen.getByRole('combobox', { name: /Sort by criterion/i });
    fireEvent.change(sortByDueDate, { target: { value: 'dueDate' } });

    await waitFor(() => {
      const taskWithoutDueDate = screen.getAllByText('Task without due date')[0];
      expect(taskWithoutDueDate).toBeInTheDocument();
    });
  });
});
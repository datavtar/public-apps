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

// Mock window.confirm
const originalConfirm = window.confirm;

beforeEach(() => {
  window.confirm = jest.fn(() => true); // Always return true for confirm
  localStorage.clear();
});

afterEach(() => {
  window.confirm = originalConfirm;
  jest.clearAllMocks();
});

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
  });

  it('displays loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('loads todos from localStorage or sample data', async () => {
    localStorage.setItem('productManagerTodos', JSON.stringify([{ id: 'test-id', title: 'Test Todo', description: 'Test Description', priority: 'medium', status: 'pending', dueDate: '2024-01-01', createdAt: '2024-01-01', updatedAt: '2024-01-01', tags: [] }]));
    render(<App />);
    await waitFor(() => expect(screen.getByText('Test Todo')).toBeInTheDocument());
  });

  it('adds a new todo', async () => {
    render(<App />);

    // Open the modal
    fireEvent.click(screen.getByRole('button', { name: /^New Task$/i }));

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Todo' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByLabelText('Due Date'), { target: { value: '2024-12-31' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /^Add Task$/i }));

    // Wait for the todo to appear
    await waitFor(() => expect(screen.getByText('New Todo')).toBeInTheDocument());
  });

  it('edits an existing todo', async () => {
    // Arrange
    localStorage.setItem('productManagerTodos', JSON.stringify([{ id: 'edit-id', title: 'Original Todo', description: 'Original Description', priority: 'medium', status: 'pending', dueDate: '2024-01-01', createdAt: '2024-01-01', updatedAt: '2024-01-01', tags: [] }]));
    render(<App />);
    await waitFor(() => screen.getByText('Original Todo'));

    // Act
    fireEvent.click(screen.getByRole('button', { name: /^Edit Original Todo$/i }));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Todo' } });
    fireEvent.click(screen.getByRole('button', { name: /^Update Task$/i }));

    // Assert
    await waitFor(() => expect(screen.getByText('Updated Todo')).toBeInTheDocument());
    expect(screen.queryByText('Original Todo')).toBeNull();
  });

  it('deletes a todo', async () => {
    localStorage.setItem('productManagerTodos', JSON.stringify([{ id: 'delete-id', title: 'Todo to Delete', description: 'Description to Delete', priority: 'medium', status: 'pending', dueDate: '2024-01-01', createdAt: '2024-01-01', updatedAt: '2024-01-01', tags: [] }]));
    render(<App />);
    await waitFor(() => screen.getByText('Todo to Delete'));
    fireEvent.click(screen.getByRole('button', { name: /^Delete Todo to Delete$/i }));
    await waitFor(() => expect(screen.queryByText('Todo to Delete')).toBeNull());
  });

  it('filters todos by status', async () => {
    localStorage.setItem(
      'productManagerTodos',
      JSON.stringify([
        {
          id: '1',
          title: 'Pending Todo',
          description: 'Description',
          priority: 'medium',
          status: 'pending',
          dueDate: '2024-01-01',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          tags: [],
        },
        {
          id: '2',
          title: 'Completed Todo',
          description: 'Description',
          priority: 'medium',
          status: 'completed',
          dueDate: '2024-01-01',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          tags: [],
        },
      ])
    );
    render(<App />);
    await waitFor(() => screen.getByText('Pending Todo'));
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'completed' } });
    await waitFor(() => expect(screen.queryByText('Pending Todo')).toBeNull());
    expect(screen.getByText('Completed Todo')).toBeInTheDocument();
  });

  it('filters todos by priority', async () => {
    localStorage.setItem(
      'productManagerTodos',
      JSON.stringify([
        {
          id: '1',
          title: 'High Priority Todo',
          description: 'Description',
          priority: 'high',
          status: 'pending',
          dueDate: '2024-01-01',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          tags: [],
        },
        {
          id: '2',
          title: 'Low Priority Todo',
          description: 'Description',
          priority: 'low',
          status: 'pending',
          dueDate: '2024-01-01',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          tags: [],
        },
      ])
    );
    render(<App />);
    await waitFor(() => screen.getByText('High Priority Todo'));
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'low' } });
    await waitFor(() => expect(screen.queryByText('High Priority Todo')).toBeNull());
    expect(screen.getByText('Low Priority Todo')).toBeInTheDocument();
  });

  it('filters todos by tag', async () => {
    localStorage.setItem(
      'productManagerTodos',
      JSON.stringify([
        {
          id: '1',
          title: 'Tagged Todo',
          description: 'Description',
          priority: 'high',
          status: 'pending',
          dueDate: '2024-01-01',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          tags: ['test'],
        },
        {
          id: '2',
          title: 'Untagged Todo',
          description: 'Description',
          priority: 'low',
          status: 'pending',
          dueDate: '2024-01-01',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          tags: [],
        },
      ])
    );
    render(<App />);
    await waitFor(() => screen.getByText('Tagged Todo'));
    fireEvent.change(screen.getByLabelText('Tag'), { target: { value: 'test' } });
    await waitFor(() => expect(screen.getByText('Tagged Todo')).toBeInTheDocument());
    expect(screen.queryByText('Untagged Todo')).toBeNull();
  });

  it('searches todos', async () => {
    localStorage.setItem(
      'productManagerTodos',
      JSON.stringify([
        {
          id: '1',
          title: 'Searchable Todo',
          description: 'Description',
          priority: 'high',
          status: 'pending',
          dueDate: '2024-01-01',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          tags: [],
        },
        {
          id: '2',
          title: 'Another Todo',
          description: 'Description',
          priority: 'low',
          status: 'pending',
          dueDate: '2024-01-01',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          tags: [],
        },
      ])
    );
    render(<App />);
    await waitFor(() => screen.getByText('Searchable Todo'));
    fireEvent.change(screen.getByPlaceholderText('Search tasks...'), { target: { value: 'Searchable' } });
    expect(screen.getByText('Searchable Todo')).toBeInTheDocument();
    expect(screen.queryByText('Another Todo')).toBeNull();
  });

  it('toggles dark mode', () => {
    render(<App />);
    const toggleButton = screen.getByRole('button', { name: /Toggle dark mode/i });
    fireEvent.click(toggleButton);
    expect(localStorage.getItem('darkMode')).toBe('true');
    fireEvent.click(toggleButton);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });
});
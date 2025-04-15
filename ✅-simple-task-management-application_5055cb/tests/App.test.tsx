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

// Mock crypto.randomUUID
const mockUUID = 'test-uuid';
jest.spyOn(global.crypto, 'randomUUID').mockReturnValue(mockUUID);


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  test('renders initial todos from localStorage if available', async () => {
    localStorageMock.setItem('todos', JSON.stringify([{ id: '1', text: 'Test Todo', completed: false, createdAt: Date.now() }]));
    render(<App />);
    await waitFor(() => expect(screen.getByText('Test Todo')).toBeInTheDocument());
  });

  test('renders initial todos if localStorage is empty', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('Learn React')).toBeInTheDocument());
    expect(screen.getByText('Learn TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Build a To-Do App')).toBeInTheDocument();
  });

  test('adds a new todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    const addButton = screen.getByRole('button', { name: /^Add Task$/i });

    fireEvent.change(inputElement, { target: { value: 'New Todo' } });
    fireEvent.click(addButton);

    await waitFor(() => expect(screen.getByText('New Todo')).toBeInTheDocument());
  });

  test('toggles a todo', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Learn React'));
    const checkbox = screen.getByRole('checkbox', {name: /learn react/i});
    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox).toBeChecked());
    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox).not.toBeChecked());
  });

  test('deletes a todo', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Learn React'));
    const deleteButton = screen.getByRole('button', {name: /delete task: learn react/i});
    fireEvent.click(deleteButton);
    await waitFor(() => expect(screen.queryByText('Learn React')).not.toBeInTheDocument());
  });

  test('edits a todo', async () => {
      render(<App />);
      await waitFor(() => screen.getByText('Learn React'));

      const editButton = screen.getByRole('button', { name: /edit task: learn react/i });
      fireEvent.click(editButton);

      const editInput = screen.getByRole('textbox', {name: /edit task: learn react/i});
      fireEvent.change(editInput, { target: { value: 'Edited Todo' } });

      const saveButton = screen.getByRole('button', { name: /save changes for task: edited todo/i });
      fireEvent.click(saveButton);

      await waitFor(() => expect(screen.getByText('Edited Todo')).toBeInTheDocument());
      expect(screen.queryByRole('textbox', {name: /edit task: edited todo/i})).not.toBeInTheDocument();
  });

  test('filters todos', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Learn React'));

    const completedFilterButton = screen.getByRole('button', { name: /completed/i });
    fireEvent.click(completedFilterButton);

    expect(screen.getByText('Learn React')).toBeInTheDocument(); //completed
    expect(screen.queryByText('Learn TypeScript')).not.toBeInTheDocument(); //active
    expect(screen.queryByText('Build a To-Do App')).not.toBeInTheDocument(); //active

    const activeButton = screen.getByRole('button', { name: /active/i });
    fireEvent.click(activeButton);

     expect(screen.queryByText('Learn React')).not.toBeInTheDocument(); //completed
    expect(screen.getByText('Learn TypeScript')).toBeInTheDocument(); //active
    expect(screen.getByText('Build a To-Do App')).toBeInTheDocument(); //active

    const allFilterButton = screen.getByRole('button', { name: /all/i });
    fireEvent.click(allFilterButton);

    expect(screen.getByText('Learn React')).toBeInTheDocument(); //completed
    expect(screen.getByText('Learn TypeScript')).toBeInTheDocument(); //active
    expect(screen.getByText('Build a To-Do App')).toBeInTheDocument(); //active
  });

  test('searches todos', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Learn React'));
    const searchInput = screen.getByRole('textbox', { name: /search tasks/i });
    fireEvent.change(searchInput, { target: { value: 'React' } });
    expect(screen.getByText('Learn React')).toBeInTheDocument();
    expect(screen.queryByText('Learn TypeScript')).not.toBeInTheDocument();
    expect(screen.queryByText('Build a To-Do App')).not.toBeInTheDocument();
  });

  test('handles error state when loading fails', async () => {
    const originalGetItem = localStorageMock.getItem;
    localStorageMock.getItem = jest.fn().mockImplementation(() => {
        throw new Error('Failed to load data');
    });
    render(<App />);

    await waitFor(() => expect(screen.getByText('Failed to load your tasks. Please try refreshing the page.')).toBeInTheDocument());

    localStorageMock.getItem = originalGetItem;
});


  test('toggles dark mode', async () => {
    render(<App />);
    const darkModeButton = screen.getByRole('switch', { name: /switch to dark mode/i });
    fireEvent.click(darkModeButton);

    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(darkModeButton);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
});

  test('displays a message when there are no tasks', async () => {
    localStorageMock.setItem('todos', JSON.stringify([]));
    render(<App />);
    await waitFor(() => expect(screen.getByText("You haven't added any tasks yet!")).toBeInTheDocument());
  });
});
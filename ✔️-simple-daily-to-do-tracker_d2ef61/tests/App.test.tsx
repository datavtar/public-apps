import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
    clear(): void {
      store = {};
    },
    removeItem(key: string): void {
      delete store[key];
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
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),  // you can also use addListener instead of addEventListener if you prefer
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Simple Todo App/i)).toBeInTheDocument();
  });

  test('adds a task', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Task description/i);
    fireEvent.change(inputElement, { target: { value: 'New Task' } });
    const addButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(addButton);
    expect(screen.getByText(/New Task/i)).toBeInTheDocument();
  });

  test('toggles task completion', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Task description/i);
    fireEvent.change(inputElement, { target: { value: 'Task to Complete' } });
    const addButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(addButton);

    const completeButton = screen.getByRole('button', {name: /Mark as complete/i});
    fireEvent.click(completeButton);

    expect(screen.getByText(/Task to Complete/i)).toHaveClass('line-through');
  });

  test('removes a task', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Task description/i);
    fireEvent.change(inputElement, { target: { value: 'Task to Remove' } });
    const addButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(addButton);

    const deleteButton = screen.getByRole('button', {name: /Delete task/i});
    fireEvent.click(deleteButton);

    expect(screen.queryByText(/Task to Remove/i)).toBeNull();
  });

  test('edits a task', () => {
    render(<App />);

    const inputElement = screen.getByLabelText(/Task description/i);
    fireEvent.change(inputElement, { target: { value: 'Task to Edit' } });
    const addButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(addButton);

    const editButton = screen.getByRole('button', {name: /Edit task/i});
    fireEvent.click(editButton);

    const editInputElement = screen.getByLabelText(/Edit task/i);
    fireEvent.change(editInputElement, { target: { value: 'Edited Task' } });

    const saveButton = screen.getByRole('button', {name: /Save changes/i});
    fireEvent.click(saveButton);

    expect(screen.getByText(/Edited Task/i)).toBeInTheDocument();
    expect(screen.queryByText(/Task to Edit/i)).toBeNull();
  });

  test('adds a task with due date and time', () => {
    render(<App />);

    const taskInput = screen.getByLabelText(/Task description/i);
    fireEvent.change(taskInput, { target: { value: 'Task with Due Date' } });

    const dateInput = screen.getByLabelText(/Due date/i);
    fireEvent.change(dateInput, { target: { value: '2024-12-25' } });

    const timeInput = screen.getByLabelText(/Due time/i);
    fireEvent.change(timeInput, { target: { value: '10:00' } });

    const addButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(addButton);

    expect(screen.getByText(/Dec 25, 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/10:00/i)).toBeInTheDocument();
  });

  test('displays no tasks message when there are no tasks', () => {
    render(<App />);
    expect(screen.getByText(/No tasks yet. Add one above!/i)).toBeInTheDocument();
  });

  test('dark mode toggle works', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i});
    fireEvent.click(darkModeButton);
    expect(localStorageMock.getItem('darkMode')).toBe('true');
  });
});
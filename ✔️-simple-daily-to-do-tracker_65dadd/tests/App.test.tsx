import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('renders without crashing', () => {
    render(<App />);
  });

  it('renders the header text', () => {
    render(<App />);
    expect(screen.getByText(/Simple Todo App/i)).toBeInTheDocument();
  });

  it('allows adding a new task', () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /Task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'New Task' } });
    fireEvent.click(addButton);

    expect(screen.getByText(/New Task/i)).toBeInTheDocument();
  });

  it('stores tasks in localStorage', () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /Task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Task 1' } });
    fireEvent.click(addButton);

    expect(localStorageMock.getItem('tasks')).toContain('Task 1');
  });

  it('toggles task completion', () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /Task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Task to complete' } });
    fireEvent.click(addButton);

    const completeButton = screen.getByRole('button', { name: /Mark as complete/i });
    fireEvent.click(completeButton);

    expect(screen.getByText(/Task to complete/i)).toHaveClass('line-through');
  });

  it('removes a task', () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /Task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Task to remove' } });
    fireEvent.click(addButton);

    const removeButton = screen.getByRole('button', { name: /Delete task/i });
    fireEvent.click(removeButton);

    expect(screen.queryByText(/Task to remove/i)).toBeNull();
  });

  it('edits a task', () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /Task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Task to edit' } });
    fireEvent.click(addButton);

    const editButton = screen.getByRole('button', { name: /Edit task/i });
    fireEvent.click(editButton);

    const editInputElement = screen.getByRole('textbox', { name: /Edit task/i });
    fireEvent.change(editInputElement, { target: { value: 'Edited Task' } });

    const saveButton = screen.getByRole('button', { name: /Save changes/i });
    fireEvent.click(saveButton);

    expect(screen.getByText(/Edited Task/i)).toBeInTheDocument();
  });

  it('allows setting a due date and time', () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /Task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });
    const dateInput = screen.getByRole('textbox', {name: /Due date/i})
    const timeInput = screen.getByRole('textbox', {name: /Due time/i})

    fireEvent.change(inputElement, { target: { value: 'Task with due date' } });
    fireEvent.change(dateInput, { target: { value: '2024-12-31' } });
    fireEvent.change(timeInput, { target: { value: '12:00' } });
    fireEvent.click(addButton);

    expect(screen.getByText(/Dec 31, 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/12:00/i)).toBeInTheDocument();
  });

  it('displays no tasks message when there are no tasks', () => {
    render(<App />);
    expect(screen.getByText(/No tasks yet. Add one above!/i)).toBeInTheDocument();
  });


  it('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeButton);
    expect(localStorageMock.getItem('darkMode')).toBe('true');
    fireEvent.click(darkModeButton);
    expect(localStorageMock.getItem('darkMode')).toBe('false');
  });
});

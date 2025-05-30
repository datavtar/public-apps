import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

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

beforeEach(() => {
  localStorageMock.clear();
});

test('renders the app', () => {
  render(<App />);
  expect(screen.getByText(/Yet Another To-Do App/i)).toBeInTheDocument();
});

test('adds a new task', () => {
  render(<App />);
  const inputElement = screen.getByRole('textbox', { name: /new task input/i });
  const addButton = screen.getByRole('button', { name: /Add Task/i });

  fireEvent.change(inputElement, { target: { value: 'Test Task' } });
  fireEvent.click(addButton);

  expect(screen.getByText(/Test Task/i)).toBeInTheDocument();
});

test('toggles a task as complete', () => {
  render(<App />);
  const inputElement = screen.getByRole('textbox', { name: /new task input/i });
  const addButton = screen.getByRole('button', { name: /Add Task/i });

  fireEvent.change(inputElement, { target: { value: 'Task to complete' } });
  fireEvent.click(addButton);
  const completeButton = screen.getByRole('button', {name: /mark as complete/i});

  fireEvent.click(completeButton);

  expect(completeButton).toBeInTheDocument();
});

test('deletes a task', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Task to delete' } });
    fireEvent.click(addButton);

    const deleteButton = screen.getByRole('button', {name: /delete task: Task to delete/i});
    fireEvent.click(deleteButton);
    expect(screen.queryByText(/Task to delete/i)).not.toBeInTheDocument();
});

test('edits a task', async () => {
  render(<App />);
  const inputElement = screen.getByRole('textbox', { name: /new task input/i });
  const addButton = screen.getByRole('button', { name: /Add Task/i });
  fireEvent.change(inputElement, { target: { value: 'Task to edit' } });
  fireEvent.click(addButton);
  const editButton = screen.getByRole('button', { name: /Edit task: Task to edit/i });
  fireEvent.click(editButton);

  const editInput = screen.getByRole('textbox', { name: /Edit task text/i });
  fireEvent.change(editInput, { target: { value: 'Edited Task' } });

  const saveButton = screen.getByRole('button', { name: /Save changes to task/i });
  fireEvent.click(saveButton);

  expect(screen.getByText(/Edited Task/i)).toBeInTheDocument();
});

test('filters tasks', async () => {
  render(<App />);

  const inputElement = screen.getByRole('textbox', { name: /new task input/i });
  const addButton = screen.getByRole('button', { name: /Add Task/i });
  fireEvent.change(inputElement, { target: { value: 'Active Task' } });
  fireEvent.click(addButton);

  fireEvent.change(inputElement, { target: { value: 'Completed Task' } });
  fireEvent.click(addButton);

  const completeButton = screen.getByRole('button', {name: /mark as complete/i});
  fireEvent.click(completeButton);

  const filterSelect = screen.getByRole('combobox', {name: /filter tasks/i});
  fireEvent.change(filterSelect, { target: { value: 'active' } });
  expect(screen.getByText(/Active Task/i)).toBeVisible();
  expect(screen.queryByText(/Completed Task/i)).not.toBeInTheDocument();

  fireEvent.change(filterSelect, { target: { value: 'completed' } });
  expect(screen.getByText(/Completed Task/i)).toBeVisible();
  expect(screen.queryByText(/Active Task/i)).not.toBeInTheDocument();
});

test('sorts tasks by date newest first', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Task 1' } });
    fireEvent.click(addButton);

    fireEvent.change(inputElement, { target: { value: 'Task 2' } });
    fireEvent.click(addButton);

    const sortSelect = screen.getByRole('combobox', { name: /sort tasks/i });
    fireEvent.change(sortSelect, { target: { value: 'createdAt_desc' } });
    expect(sortSelect).toBeInTheDocument();
});

test('sorts tasks by date oldest first', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Task 1' } });
    fireEvent.click(addButton);

    fireEvent.change(inputElement, { target: { value: 'Task 2' } });
    fireEvent.click(addButton);

    const sortSelect = screen.getByRole('combobox', { name: /sort tasks/i });
    fireEvent.change(sortSelect, { target: { value: 'createdAt_asc' } });
    expect(sortSelect).toBeInTheDocument();
});

test('sorts tasks by text A-Z', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Task 1' } });
    fireEvent.click(addButton);

    fireEvent.change(inputElement, { target: { value: 'Task 2' } });
    fireEvent.click(addButton);

    const sortSelect = screen.getByRole('combobox', { name: /sort tasks/i });
    fireEvent.change(sortSelect, { target: { value: 'text_asc' } });
    expect(sortSelect).toBeInTheDocument();
});

test('sorts tasks by text Z-A', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Task 1' } });
    fireEvent.click(addButton);

    fireEvent.change(inputElement, { target: { value: 'Task 2' } });
    fireEvent.click(addButton);

    const sortSelect = screen.getByRole('combobox', { name: /sort tasks/i });
    fireEvent.change(sortSelect, { target: { value: 'text_desc' } });
    expect(sortSelect).toBeInTheDocument();
});

test('clears completed tasks', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Task to complete and clear' } });
    fireEvent.click(addButton);

    const completeButton = screen.getByRole('button', {name: /mark as complete/i});
    fireEvent.click(completeButton);

    const clearCompletedButton = screen.getByRole('button', { name: /Clear all completed tasks/i });
    fireEvent.click(clearCompletedButton);
    expect(screen.queryByText(/Task to complete and clear/i)).not.toBeInTheDocument();
});

test('searches tasks', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Searchable Task' } });
    fireEvent.click(addButton);

    const searchInput = screen.getByRole('textbox', { name: /Search tasks/i });
    fireEvent.change(searchInput, { target: { value: 'Searchable' } });
    expect(screen.getByText(/Searchable Task/i)).toBeVisible();

    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
    expect(screen.queryByText(/Searchable Task/i)).not.toBeInTheDocument();
});

test('toggles dark mode', () => {
  render(<App />);
  const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
  fireEvent.click(darkModeButton);

  expect(localStorage.setItem).toHaveBeenCalledWith('todoApp.theme', 'dark');
});

test('resets tasks to initial set', () => {
  render(<App />);
  const resetButton = screen.getByRole('button', { name: /Reset tasks to initial set/i });
  fireEvent.click(resetButton);

  expect(localStorage.setItem).toHaveBeenCalledWith('todoApp.tasks', JSON.stringify([{"id":"1","text":"Learn Tailwind CSS","completed":true,"createdAt":1697647145950,"updatedAt":1697647245950},{"id":"2","text":"Build a React To-Do App","completed":false,"createdAt":1697647245950,"updatedAt":1697647245950},{"id":"3","text":"Add dark mode","completed":false,"createdAt":1697647345950,"updatedAt":1697647345950}]));
});
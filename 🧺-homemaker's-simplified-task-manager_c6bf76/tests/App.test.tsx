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


beforeEach(() => {
  localStorage.clear();
});


test('renders the component', () => {
  render(<App />);
  expect(screen.getByText(/Homemaker's Helper/i)).toBeInTheDocument();
});

test('adds a new todo', () => {
  render(<App />);
  const inputElement = screen.getByRole('textbox', { name: /new task input/i });
  const addButton = screen.getByRole('button', { name: /add task/i });

  fireEvent.change(inputElement, { target: { value: 'New Todo' } });
  fireEvent.click(addButton);

  expect(screen.getByText(/New Todo/i)).toBeInTheDocument();
});

test('toggles a todo as completed', () => {
    render(<App />);

    // Add a todo first
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Test Todo' } });
    fireEvent.click(addButton);

    const toggleButton = screen.getByRole('button', { name: /mark task as complete/i });
    fireEvent.click(toggleButton);

    expect(toggleButton).toBeInTheDocument();
});

test('deletes a todo', () => {
  render(<App />);

  // Add a todo first
  const inputElement = screen.getByRole('textbox', { name: /new task input/i });
  const addButton = screen.getByRole('button', { name: /add task/i });

  fireEvent.change(inputElement, { target: { value: 'Todo to Delete' } });
  fireEvent.click(addButton);

  const deleteButton = screen.getByRole('button', { name: /delete task: Todo to Delete/i });
  fireEvent.click(deleteButton);

  expect(screen.queryByText(/Todo to Delete/i)).toBeNull();
});

test('filters todos', async () => {
  render(<App />);

    // Add some todos
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Active Task' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Completed Task' } });
    fireEvent.click(addButton);

    const completeButton = screen.getByRole('button', {name: /mark task as complete/i});
    fireEvent.click(completeButton);


  const activeFilterButton = screen.getByRole('button', { name: /active/i });
  fireEvent.click(activeFilterButton);

  expect(screen.getByText(/Active Task/i)).toBeInTheDocument();
  expect(screen.queryByText(/Completed Task/i)).toBeNull();

  const completedFilterButton = screen.getByRole('button', { name: /completed/i });
  fireEvent.click(completedFilterButton);

  expect(screen.getByText(/Completed Task/i)).toBeInTheDocument();
  expect(screen.queryByText(/Active Task/i)).toBeNull();

  const allFilterButton = screen.getByRole('button', { name: /all/i });
  fireEvent.click(allFilterButton);

  expect(screen.getByText(/Active Task/i)).toBeInTheDocument();
  expect(screen.getByText(/Completed Task/i)).toBeInTheDocument();
});

test('searches todos', () => {
  render(<App />);

    // Add some todos
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Find Me' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Hide Me' } });
    fireEvent.click(addButton);

  const searchInput = screen.getByRole('textbox', { name: /search tasks input/i });
  fireEvent.change(searchInput, { target: { value: 'Find' } });

  expect(screen.getByText(/Find Me/i)).toBeInTheDocument();
  expect(screen.queryByText(/Hide Me/i)).toBeNull();
});

test('opens and closes the edit modal', async () => {
    render(<App />);

    // Add a todo first
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Task to Edit' } });
    fireEvent.click(addButton);

    const editButton = screen.getByRole('button', { name: /edit task: Task to Edit/i });

    fireEvent.click(editButton);

    expect(screen.getByRole('heading', { name: /edit task/i })).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close edit modal/i });
    fireEvent.click(closeButton);

    // Wait for the modal to close (animation might cause flakiness without await)
    // await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));

    expect(screen.queryByRole('heading', { name: /edit task/i })).not.toBeInTheDocument();
});

test('edits a todo', async () => {
    render(<App />);

    // Add a todo first
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Original Task' } });
    fireEvent.click(addButton);

    const editButton = screen.getByRole('button', { name: /edit task: Original Task/i });
    fireEvent.click(editButton);

    const editInput = screen.getByRole('textbox', { name: /edit task description/i });
    fireEvent.change(editInput, { target: { value: 'Edited Task' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    expect(screen.getByText(/Edited Task/i)).toBeInTheDocument();
    expect(screen.queryByText(/Original Task/i)).toBeNull();
});

test('switches between dark and light mode', () => {
    render(<App />);

    const themeToggleButton = screen.getByRole('button', { name: /switch to dark mode/i });

    fireEvent.click(themeToggleButton);

    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode_homemaker', 'true');


    const themeToggleButtonLight = screen.getByRole('button', { name: /switch to light mode/i });
    fireEvent.click(themeToggleButtonLight);

    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode_homemaker', 'false');
});
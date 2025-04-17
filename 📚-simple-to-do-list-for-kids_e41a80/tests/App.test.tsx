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

beforeEach(() => {
  localStorageMock.clear();
});


test('renders the component', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /My Fun To-Do List!/i })).toBeInTheDocument();
});

test('shows loading state', () => {
  render(<App />);
  expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
});

test('adds a task', async () => {
    render(<App />);

    // Wait for loading to complete
    await waitFor(() => expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument());

    const inputElement = screen.getByRole('textbox', { name: /New task input/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Buy milk' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Buy milk')).toBeInTheDocument();
});

test('toggles a task completion', async () => {
    render(<App />);

    // Wait for loading to complete
    await waitFor(() => expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument());

    const inputElement = screen.getByRole('textbox', { name: /New task input/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Walk the dog' } });
    fireEvent.click(addButton);

    const taskElement = screen.getByText('Walk the dog');
    const toggleButton = taskElement.closest('div')?.querySelector('button[aria-label*="Mark task as done"]');

    if (toggleButton) {
        fireEvent.click(toggleButton);
        expect(taskElement).toHaveStyle('text-decoration: line-through');
    } else {
        throw new Error('Toggle button not found');
    }
});

test('deletes a task', async () => {
    render(<App />);

    // Wait for loading to complete
    await waitFor(() => expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument());

    const inputElement = screen.getByRole('textbox', { name: /New task input/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Do laundry' } });
    fireEvent.click(addButton);

    const taskElement = screen.getByText('Do laundry');
    const deleteButton = taskElement.closest('div')?.querySelector('button[aria-label*="Delete task"]');

    if (deleteButton) {
        fireEvent.click(deleteButton);
        await waitFor(() => expect(screen.queryByText('Do laundry')).not.toBeInTheDocument());
    } else {
        throw new Error('Delete button not found');
    }
});

test('shows no tasks message when there are no tasks', async () => {
    render(<App />);

    // Wait for loading to complete
    await waitFor(() => expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument());

    expect(screen.getByText('No tasks yet! Add something fun to do!')).toBeInTheDocument();
});

test('local storage is used to persist tasks', async () => {
    const initialTasks = [{ id: '1', text: 'Initial Task', completed: false }];
    localStorageMock.setItem('kiddoAppTasks', JSON.stringify(initialTasks));

    render(<App />);

    // Wait for loading to complete
    await waitFor(() => expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument());

    expect(screen.getByText('Initial Task')).toBeInTheDocument();
});
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


test('renders the app', () => {
  render(<App />);
  expect(screen.getByText(/My Tasks/i)).toBeInTheDocument();
});

test('adds a task', async () => {
  render(<App />);
  const inputElement = screen.getByRole('textbox', { name: /new task title/i });
  const addButton = screen.getByRole('button', { name: /^Add$/i });

  fireEvent.change(inputElement, { target: { value: 'New Task' } });
  fireEvent.click(addButton);

  await waitFor(() => {
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });
});

test('toggles task completion', async () => {
  render(<App />);
  const inputElement = screen.getByRole('textbox', { name: /new task title/i });
  const addButton = screen.getByRole('button', { name: /^Add$/i });

  fireEvent.change(inputElement, { target: { value: 'Task to Complete' } });
  fireEvent.click(addButton);

  await waitFor(() => {
    expect(screen.getByText('Task to Complete')).toBeInTheDocument();
  });

  const completeButton = screen.getByRole('button', { name: /mark as complete/i });

  fireEvent.click(completeButton);

  await waitFor(() => {
    expect(screen.getByText('Task to Complete')).toHaveClass('line-through');
  });

  const incompleteButton = screen.getByRole('button', { name: /mark as incomplete/i });
  fireEvent.click(incompleteButton);

  await waitFor(() => {
    expect(screen.getByText('Task to Complete')).not.toHaveClass('line-through');
  });
});

test('deletes a task', async () => {
  render(<App />);
  const inputElement = screen.getByRole('textbox', { name: /new task title/i });
  const addButton = screen.getByRole('button', { name: /^Add$/i });

  fireEvent.change(inputElement, { target: { value: 'Task to Delete' } });
  fireEvent.click(addButton);

  await waitFor(() => {
    expect(screen.getByText('Task to Delete')).toBeInTheDocument();
  });

  const deleteButton = screen.getByRole('button', { name: /delete task/i });
  fireEvent.click(deleteButton);

  await waitFor(() => {
    expect(screen.queryByText('Task to Delete')).toBeNull();
  });
});

test('filters tasks', async () => {
  render(<App />);
  const inputElement = screen.getByRole('textbox', { name: /new task title/i });
  const addButton = screen.getByRole('button', { name: /^Add$/i });

  fireEvent.change(inputElement, { target: { value: 'Active Task' } });
  fireEvent.click(addButton);

  fireEvent.change(inputElement, { target: { value: 'Completed Task' } });
  fireEvent.click(addButton);

  const completeButton = screen.getAllByRole('button', { name: /mark as complete/i })[0];
  fireEvent.click(completeButton);

  const activeButton = screen.getByText('Active');
  fireEvent.click(activeButton);

  await waitFor(() => {
    expect(screen.getByText('Active Task')).toBeInTheDocument();
    expect(screen.queryByText('Completed Task')).toBeNull();
  });

  const completedButton = screen.getByText('Completed');
  fireEvent.click(completedButton);

  await waitFor(() => {
    expect(screen.queryByText('Active Task')).toBeNull();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });

  const allButton = screen.getByText('All');
  fireEvent.click(allButton);

  await waitFor(() => {
    expect(screen.getByText('Active Task')).toBeInTheDocument();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });
});

test('clears completed tasks', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task title/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });
  
    fireEvent.change(inputElement, { target: { value: 'Task 1' } });
    fireEvent.click(addButton);
  
    fireEvent.change(inputElement, { target: { value: 'Task 2' } });
    fireEvent.click(addButton);
  
    const completeButton = screen.getByRole('button', { name: /mark as complete/i });
    fireEvent.click(completeButton);
  
    const clearCompletedButton = screen.getByText('Clear completed');
    fireEvent.click(clearCompletedButton);
  
    await waitFor(() => {
      expect(screen.queryByText('Task 2')).toBeNull();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
  });
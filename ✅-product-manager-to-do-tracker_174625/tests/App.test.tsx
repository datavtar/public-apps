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


beforeEach(() => {
  localStorage.clear();
});


test('renders app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Product Manager Task Board/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders initial tasks from localStorage if available', () => {
  const initialTasks = [
    {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      priority: 'high',
      status: 'todo',
      tags: ['test'],
    },
  ];
  localStorage.setItem('productManagerTasks', JSON.stringify(initialTasks));

  render(<App />);

  expect(screen.getByText(/Test Task/i)).toBeInTheDocument();
});

test('adds a new task', async () => {
  render(<App />);

  // Arrange
  const addTaskButton = screen.getByRole('button', { name: /Add Task/i });

  // Act
  fireEvent.click(addTaskButton);
  const titleInput = screen.getByLabelText(/Task Title/i);
  fireEvent.change(titleInput, { target: { value: 'New Task Title' } });

  const saveButton = screen.getByRole('button', { name: /Create Task/i });
  fireEvent.click(saveButton);

  // Assert
  expect(screen.getByText(/New Task Title/i)).toBeInTheDocument();
});

test('updates a task status', async () => {
  // Arrange
  render(<App />);
  const initialTask = screen.getByText(/Complete market research for new feature/i);
  expect(initialTask).toBeInTheDocument();

  const toggleStatusButton = screen.getAllByRole('button', {name: /^Mark task as/i})[0];
  // Act
  fireEvent.click(toggleStatusButton);

  // Assert
  expect(screen.getByText(/Complete market research for new feature/i)).toBeInTheDocument();
});

test('can switch to dashboard view', () => {
    render(<App />);
    const dashboardButton = screen.getByRole('button', { name: /Dashboard view/i });
    fireEvent.click(dashboardButton);
    expect(screen.getByText(/Total Tasks/i)).toBeInTheDocument();
});

test('can switch to list view', () => {
    render(<App />);
    const dashboardButton = screen.getByRole('button', { name: /Dashboard view/i });
    fireEvent.click(dashboardButton);

    const listButton = screen.getByRole('button', { name: /List view/i });
    fireEvent.click(listButton);
    expect(screen.getByRole('textbox', {name: /Search tasks/i})).toBeInTheDocument();
});

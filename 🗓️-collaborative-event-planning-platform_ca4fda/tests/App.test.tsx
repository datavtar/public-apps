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

// Mock the window.matchMedia
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
    // Set initial localStorage values
    localStorage.setItem('users', JSON.stringify([{ id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner' }]));
    localStorage.setItem('events', JSON.stringify([{ id: '1', title: 'Test Event', date: '2024-01-01', location: 'Test Location', description: 'Test Description', createdAt: new Date().toISOString() }]));
    localStorage.setItem('tasks', JSON.stringify([]));
    localStorage.setItem('activities', JSON.stringify([]));
    localStorage.setItem('files', JSON.stringify([]));
    localStorage.setItem('notes', JSON.stringify([]));
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('Event Planner')).toBeInTheDocument();
  });

  test('renders the current event title if an event exists', () => {
    render(<App />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  test('renders the navigation links', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /activity feed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /task management/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /file sharing/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
  });

  test('opens and closes the Add Task modal', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /task management/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Add Task$/i }));
    expect(screen.getByText('Create New Task')).toBeVisible();

    // Close the modal
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    // Use queryByText to check if the modal is no longer in the document
    expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
  });

  test('adds a task', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /task management/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Add Task$/i }));

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/task title/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Task description' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2024-02-01' } });

    // Select assigned user
    fireEvent.change(screen.getByLabelText(/assigned to/i), { target: { value: '1' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));

    // Assert
    expect(screen.getByText('New Task')).toBeVisible();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const toggleButton = screen.getByRole('button', {name: /switch to dark mode/i});
    fireEvent.click(toggleButton);
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  test('Test Add Event Modal Open and Close', async () => {
    localStorage.removeItem('events');
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: /create event/i}));
    expect(screen.getByText(/create new event/i)).toBeVisible();

    fireEvent.click(screen.getByRole('button', {name: /cancel/i}));
    expect(screen.queryByText(/create new event/i)).not.toBeInTheDocument();
  });
});
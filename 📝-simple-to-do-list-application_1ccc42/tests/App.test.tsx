import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'

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
  }))
});


// Utility function to add a task
const addTask = async (taskTitle: string) => {
  const inputElement = screen.getByPlaceholderText(/add a new task.../i) as HTMLInputElement;
  fireEvent.change(inputElement, { target: { value: taskTitle } });
  const addButton = screen.getByRole('button', { name: /^Add$/i });
  fireEvent.click(addButton);
  await waitFor(() => expect(screen.getByText(taskTitle)).toBeInTheDocument());
};



describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('adds a task to the list', async () => {
    render(<App />);
    const taskTitle = 'Buy groceries';

    await addTask(taskTitle);

    expect(screen.getByText(taskTitle)).toBeInTheDocument();
  });

  test('toggles task completion', async () => {
    render(<App />);
    const taskTitle = 'Pay bills';
    await addTask(taskTitle);

    const checkbox = screen.getByRole('button', { 'aria-label': 'Mark as complete' });
    fireEvent.click(checkbox);

    await waitFor(() => expect(screen.getByRole('button', { 'aria-label': 'Mark as incomplete' })).toBeInTheDocument());
  });

  test('deletes a task from the list', async () => {
    render(<App />);
    const taskTitle = 'Walk the dog';
    await addTask(taskTitle);

    const deleteButton = screen.getByRole('button', { 'aria-label': 'Delete task' });
    fireEvent.click(deleteButton);

    await waitFor(() => expect(screen.queryByText(taskTitle)).toBeNull());
  });

  test('filters tasks - active', async () => {
    render(<App />);
    await addTask('Task 1');
    await addTask('Task 2');

    // Mark Task 1 as complete
    const checkbox = screen.getByRole('button', { 'aria-label': 'Mark as complete' });
    fireEvent.click(checkbox);
    await waitFor(() => expect(screen.getByRole('button', { 'aria-label': 'Mark as incomplete' })).toBeInTheDocument());
    
    // Filter active tasks
    const activeButton = screen.getByText('Active');
    fireEvent.click(activeButton);

    // Only 'Task 2' should be present
    expect(screen.queryByText('Task 1')).toBeNull();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  test('clears completed tasks', async () => {
        render(<App />);
        await addTask('Task 1');
        await addTask('Task 2');

        // Mark Task 1 as complete
        const checkbox = screen.getByRole('button', { 'aria-label': 'Mark as complete' });
        fireEvent.click(checkbox);
        await waitFor(() => expect(screen.getByRole('button', { 'aria-label': 'Mark as incomplete' })).toBeInTheDocument());

        const clearCompletedButton = screen.getByText('Clear completed');
        fireEvent.click(clearCompletedButton);

        await waitFor(() => expect(screen.queryByText('Task 1')).toBeNull());
    });
  
  test('sets a reminder for a task', async () => {
    render(<App />);
    await addTask('Grocery Shopping');

    const setReminderButton = screen.getByRole('button', { name: 'Set Reminder' });
    const taskItem = screen.getByText('Grocery Shopping').closest('li');
    if (!taskItem) {
      throw new Error("Task item not found");
    }

    const dateInput = taskItem.querySelector('input[type="date"]') as HTMLInputElement;
    const timeInput = taskItem.querySelector('input[type="time"]') as HTMLInputElement;

    if (!dateInput || !timeInput) {
      throw new Error("Date or Time input not found");
    }

    fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
    fireEvent.change(timeInput, { target: { value: '10:00' } });

    fireEvent.click(setReminderButton);
    await waitFor(() => expect(screen.getByText(/Dec 25 at 10:00 AM/i)).toBeInTheDocument());
  });

  test('removes a reminder from a task', async () => {
    render(<App />);
    await addTask('Grocery Shopping');

    const setReminderButton = screen.getByRole('button', { name: 'Set Reminder' });
    const taskItem = screen.getByText('Grocery Shopping').closest('li');
    if (!taskItem) {
      throw new Error("Task item not found");
    }

    const dateInput = taskItem.querySelector('input[type="date"]') as HTMLInputElement;
    const timeInput = taskItem.querySelector('input[type="time"]') as HTMLInputElement;

    if (!dateInput || !timeInput) {
      throw new Error("Date or Time input not found");
    }

    fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
    fireEvent.change(timeInput, { target: { value: '10:00' } });

    fireEvent.click(setReminderButton);
    await waitFor(() => expect(screen.getByText(/Dec 25 at 10:00 AM/i)).toBeInTheDocument());

    const removeReminderButton = screen.getByRole('button', { name: /Remove/i });
    fireEvent.click(removeReminderButton);

    await waitFor(() => expect(screen.queryByText(/Dec 25 at 10:00 AM/i)).toBeNull());
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { 'aria-label': 'Switch to dark mode' });
    fireEvent.click(darkModeButton);
    expect(localStorageMock.getItem('darkMode')).toBe('true');

    const lightModeButton = screen.getByRole('button', { 'aria-label': 'Switch to light mode' });
    fireEvent.click(lightModeButton);
    expect(localStorageMock.getItem('darkMode')).toBe('false');
  });
});
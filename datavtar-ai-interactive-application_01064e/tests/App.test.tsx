import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});


// Mock window.confirm
const originalConfirm = window.confirm;

beforeAll(() => {
  window.confirm = jest.fn(() => true); // Always return true for confirmation
});

afterAll(() => {
  window.confirm = originalConfirm;
});


describe('App Component', () => {

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Task Manager/i)).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    render(<App />);

    // Open the modal
    const addTaskButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addTaskButton);

    // Fill out the form
    const titleInput = screen.getByLabelText(/Title/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    // Submit the form
    const addTaskSubmitButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskSubmitButton);

    // Wait for the task to appear
    await waitFor(() => {
      expect(screen.getByText(/Test Task/i)).toBeInTheDocument();
    });
  });

  test('deletes a task', async () => {
    render(<App />);

    // Add a task first
    const addTaskButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addTaskButton);

    const titleInput = screen.getByLabelText(/Title/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    fireEvent.change(titleInput, { target: { value: 'Task to Delete' } });
    fireEvent.change(descriptionInput, { target: { value: 'Description for deletion' } });

    const addTaskSubmitButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskSubmitButton);

    await waitFor(() => {
        expect(screen.getByText(/Task to Delete/i)).toBeInTheDocument();
    });

    // Delete the task
    const deleteTaskButton = screen.getByRole('button', {name: /Delete task Task to Delete/i});

    fireEvent.click(deleteTaskButton);

    // Wait for the task to be removed
    await waitFor(() => {
      expect(screen.queryByText(/Task to Delete/i)).not.toBeInTheDocument();
    });
  });

  test('filters tasks by title', async () => {
    render(<App />);

    // Add two tasks with different titles
    const addTaskButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addTaskButton);
    let titleInput = screen.getByLabelText(/Title/i) as HTMLInputElement;
    let descriptionInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    fireEvent.change(titleInput, { target: { value: 'Apple Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Apple Description' } });
    let addTaskSubmitButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskSubmitButton);

    fireEvent.click(addTaskButton);
    titleInput = screen.getByLabelText(/Title/i) as HTMLInputElement;
    descriptionInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    fireEvent.change(titleInput, { target: { value: 'Banana Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Banana Description' } });
    addTaskSubmitButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskSubmitButton);

    await waitFor(() => {
        expect(screen.getByText(/Apple Task/i)).toBeInTheDocument();
        expect(screen.getByText(/Banana Task/i)).toBeInTheDocument();
    });

    // Filter by 'Apple'
    const searchInput = screen.getByLabelText(/Search tasks/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Apple' } });

    // Wait for only 'Apple Task' to be present
    await waitFor(() => {
      expect(screen.getByText(/Apple Task/i)).toBeInTheDocument();
      expect(screen.queryByText(/Banana Task/i)).not.toBeInTheDocument();
    });
  });

  test('toggles dark mode', () => {
    render(<App />);
    const toggleButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(toggleButton);
    expect(localStorage.getItem('darkMode')).toBe('true');
    fireEvent.click(toggleButton);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });

});
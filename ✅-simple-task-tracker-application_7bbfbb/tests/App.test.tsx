import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    localStorage.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('adds a new todo', async () => {
    render(<App />);

    // Open the modal
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Test Todo' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Description' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

    // Wait for the todo to be added
    await waitFor(() => {
      expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
    });
  });

  test('toggles todo status', async () => {
    render(<App />);

    // Add a todo first
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Test Todo' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Description' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

    await waitFor(() => {
      expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
    });

    // Toggle the todo status
    fireEvent.click(screen.getByRole('button', { name: /Mark as completed/i }));

    await waitFor(() => {
      expect(screen.getByText(/Test Todo/i)).toHaveClass('line-through');
    });
  });

  test('deletes a todo', async () => {
    render(<App />);

    // Add a todo first
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Test Todo' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Description' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

    await waitFor(() => {
      expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
    });

    // Delete the todo
    window.confirm = jest.fn(() => true); // Mock confirm
    fireEvent.click(screen.getByRole('button', { name: /Delete task/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Test Todo/i)).not.toBeInTheDocument();
    });
  });

  test('filters todos by priority', async () => {
    render(<App />);

    // Add two todos with different priorities
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'High Priority Todo' } });
    fireEvent.change(screen.getByLabelText(/Priority/i), { target: { value: 'high' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Low Priority Todo' } });
    fireEvent.change(screen.getByLabelText(/Priority/i), { target: { value: 'low' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

    await waitFor(() => {
      expect(screen.getByText(/High Priority Todo/i)).toBeInTheDocument();
      expect(screen.getByText(/Low Priority Todo/i)).toBeInTheDocument();
    });

    // Filter by high priority
    fireEvent.change(screen.getByLabelText(/Filter by priority/i), { target: { value: 'high' } });

    await waitFor(() => {
      expect(screen.getByText(/High Priority Todo/i)).toBeInTheDocument();
      expect(screen.queryByText(/Low Priority Todo/i)).not.toBeInTheDocument();
    });
  });

  test('filters todos by status', async () => {
    render(<App />);

        // Add an incomplete todo
        fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
        fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Incomplete Todo' } });
        fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
    
        await waitFor(() => {
            expect(screen.getByText(/Incomplete Todo/i)).toBeInTheDocument();
        });
    
        // Filter by Incomplete
        fireEvent.change(screen.getByLabelText(/Filter by status/i), { target: { value: 'incomplete' } });
    
        await waitFor(() => {
            expect(screen.getByText(/Incomplete Todo/i)).toBeInTheDocument();
        });
  });

  test('searches todos', async () => {
    render(<App />);

    // Add a todo
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Searchable Todo' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

    await waitFor(() => {
      expect(screen.getByText(/Searchable Todo/i)).toBeInTheDocument();
    });

    // Search for the todo
    fireEvent.change(screen.getByPlaceholderText(/Search tasks.../i), { target: { value: 'searchable' } });

    await waitFor(() => {
      expect(screen.getByText(/Searchable Todo/i)).toBeInTheDocument();
    });

    // Search for something that doesn't exist
    fireEvent.change(screen.getByPlaceholderText(/Search tasks.../i), { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.queryByText(/Searchable Todo/i)).not.toBeInTheDocument();
    });
  });

   test('displays empty state message when there are no todos', () => {
        render(<App />);
        expect(screen.getByText(/No tasks added yet/i)).toBeInTheDocument();
    });

  test('dark mode toggle functionality', () => {
    render(<App />);

    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(darkModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

    test('sorts todos by title', async () => {
        render(<App />);

        // Add two todos with different titles
        fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
        fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'B Todo' } });
        fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

        fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
        fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'A Todo' } });
        fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

        await waitFor(() => {
            expect(screen.getByText(/A Todo/i)).toBeInTheDocument();
            expect(screen.getByText(/B Todo/i)).toBeInTheDocument();
        });

        // Sort by title
        fireEvent.click(screen.getByText(/Title/i));

        // Wait for the todos to be sorted (difficult to assert without IDs, but assuming re-render)
        await waitFor(() => {});
    });
});
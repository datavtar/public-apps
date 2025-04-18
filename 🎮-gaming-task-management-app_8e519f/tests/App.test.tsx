import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock local storage
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

// Mock crypto.randomUUID
Object.defineProperty(global.self, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid',
  },
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/GameDev Task Tracker/i)).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    fireEvent.change(inputElement, { target: { value: 'Test Task' } });

    const addButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  test('toggles task completion', async () => {
    render(<App />);
    // Add a task first
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    fireEvent.change(inputElement, { target: { value: 'Complete Me' } });

    const addButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      const taskElement = screen.getByText('Complete Me');
      expect(taskElement).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('checkbox', { name: /mark task as complete/i });

    fireEvent.click(completeButton);
    await waitFor(() => {
      expect(screen.getByText('Complete Me')).toHaveClass('line-through');
    });

  });

  test('opens and closes the delete confirmation dialog', async () => {
    render(<App />);

    // Add a task first
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    fireEvent.change(inputElement, { target: { value: 'Task to Delete' } });

    const addButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addButton);

    await waitFor(() => {
        expect(screen.getByText('Task to Delete')).toBeInTheDocument();
      });

    const deleteTaskButton = screen.getByRole('button', {name: /Delete task/i});
    fireEvent.click(deleteTaskButton);

    await waitFor(() => {
      expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();
    });

    const cancelDeleteButton = screen.getByRole('button', {name: /Cancel deletion/i});
    fireEvent.click(cancelDeleteButton);

    await waitFor(() => {
      expect(screen.queryByText(/Confirm Deletion/i)).not.toBeInTheDocument();
    });
  });


  test('deletes a task', async () => {
    render(<App />);

    // Add a task first
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    fireEvent.change(inputElement, { target: { value: 'Task to Really Delete' } });

    const addButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addButton);

    await waitFor(() => {
        expect(screen.getByText('Task to Really Delete')).toBeInTheDocument();
      });

    const deleteTaskButton = screen.getByRole('button', {name: /Delete task/i});
    fireEvent.click(deleteTaskButton);

    await waitFor(() => {
      expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();
    });

    const confirmDeleteButton = screen.getByRole('button', {name: /Confirm deletion/i});
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Task to Really Delete')).not.toBeInTheDocument();
    });
  });

  test('edits a task', async () => {
    render(<App />);
    // Add a task first
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    fireEvent.change(inputElement, { target: { value: 'Task to Edit' } });

    const addButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Task to Edit')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', {name: /Edit task/i});
    fireEvent.click(editButton);

    const editInputElement = screen.getByRole('textbox', {name: /Edit task description/i});

    fireEvent.change(editInputElement, {target: {value: 'Task was Edited'}});

    const saveButton = screen.getByRole('button', {name: /Save changes/i});

    fireEvent.click(saveButton);

    await waitFor(() => {
        expect(screen.queryByText('Task to Edit')).not.toBeInTheDocument();
        expect(screen.getByText('Task was Edited')).toBeInTheDocument();
      });
  });

  test('filters tasks', async () => {
      render(<App />);

      // Add tasks with different completion statuses
      fireEvent.change(screen.getByRole('textbox', { name: /new task description/i }), { target: { value: 'Active Task' } });
      fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

      fireEvent.change(screen.getByRole('textbox', { name: /new task description/i }), { target: { value: 'Completed Task' } });
      fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

      await waitFor(() => {
          expect(screen.getByText('Active Task')).toBeInTheDocument();
          expect(screen.getByText('Completed Task')).toBeInTheDocument();
        });

      fireEvent.click(screen.getByRole('checkbox', {name: /mark task as complete/i}));

      // Filter completed tasks
      fireEvent.click(screen.getByRole('button', { name: /completed/i }));

      await waitFor(() => {
        expect(screen.getByText('Completed Task')).toBeInTheDocument();
        expect(screen.queryByText('Active Task')).not.toBeInTheDocument();
      });

      // Filter active tasks
      fireEvent.click(screen.getByRole('button', { name: /active/i }));

      await waitFor(() => {
        expect(screen.getByText('Active Task')).toBeInTheDocument();
        expect(screen.queryByText('Completed Task')).not.toBeInTheDocument();
      });

      // Show all tasks
      fireEvent.click(screen.getByRole('button', { name: /all/i }));

      await waitFor(() => {
        expect(screen.getByText('Active Task')).toBeInTheDocument();
        expect(screen.getByText('Completed Task')).toBeInTheDocument();
      });
    });

    test('sorts tasks', async () => {
        render(<App />);

        // Add tasks with different creation times
        fireEvent.change(screen.getByRole('textbox', { name: /new task description/i }), { target: { value: 'Newer Task' } });
        fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

        await new Promise(resolve => setTimeout(resolve, 100)); // Ensure different creation times

        fireEvent.change(screen.getByRole('textbox', { name: /new task description/i }), { target: { value: 'Older Task' } });
        fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

        await waitFor(() => {
            expect(screen.getByText('Newer Task')).toBeInTheDocument();
            expect(screen.getByText('Older Task')).toBeInTheDocument();
          });

        // Sort by creation date (ascending)
        fireEvent.click(screen.getByRole('button', { name: /Sort/i }));


        // TODO: Improve this assertion - currently it's not properly verifying the sorting order.
        await waitFor(() => {
            expect(screen.getByText('Newer Task')).toBeInTheDocument();
            expect(screen.getByText('Older Task')).toBeInTheDocument();
          });

    });

    test('searches tasks', async () => {
        render(<App />);

        // Add tasks
        fireEvent.change(screen.getByRole('textbox', { name: /new task description/i }), { target: { value: 'Searchable Task' } });
        fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

        fireEvent.change(screen.getByRole('textbox', { name: /new task description/i }), { target: { value: 'Another Task' } });
        fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

        await waitFor(() => {
            expect(screen.getByText('Searchable Task')).toBeInTheDocument();
            expect(screen.getByText('Another Task')).toBeInTheDocument();
          });

        // Search for 'searchable'
        const searchInput = screen.getByRole('textbox', {name: /Search tasks/i});

        fireEvent.change(searchInput, { target: { value: 'Searchable' } });

        await waitFor(() => {
            expect(screen.getByText('Searchable Task')).toBeInTheDocument();
            expect(screen.queryByText('Another Task')).not.toBeInTheDocument();
          });

        // Clear search
        const clearButton = screen.getByRole('button', {name: /Clear search/i});
        fireEvent.click(clearButton)

        await waitFor(() => {
            expect(screen.getByText('Searchable Task')).toBeInTheDocument();
            expect(screen.getByText('Another Task')).toBeInTheDocument();
          });
    });
});
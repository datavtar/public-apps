import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the auth context
const mockAuthContextValue = {
  currentUser: { uid: 'test-user', email: 'test@example.com', first_name: 'Test' },
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
  resetPassword: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn(),
};

const renderApp = () => {
  return render(
    <AuthContext.Provider value={mockAuthContextValue}>
      <App />
    </AuthContext.Provider>
  );
};

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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });



describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders the app header with user info', () => {
    renderApp();
    expect(screen.getByText(/My To-Do App/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome, Test/i)).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    renderApp();
    const taskInput = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add Task$/i });

    fireEvent.change(taskInput, { target: { value: 'New Task' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  test('toggles task completion', async () => {
    renderApp();
    const taskInput = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add Task$/i });

    fireEvent.change(taskInput, { target: { value: 'Task to Complete' } });
    fireEvent.click(addButton);

    const completeButton = await screen.findByRole('button', { name: /Mark as complete/i });
    fireEvent.click(completeButton);

    await waitFor(() => {
        expect(screen.getByRole('button', {name: /Mark as incomplete/i})).toBeInTheDocument();
    });
  });

  test('deletes a task', async () => {
    renderApp();
    const taskInput = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add Task$/i });

    fireEvent.change(taskInput, { target: { value: 'Task to Delete' } });
    fireEvent.click(addButton);

    const deleteTaskButton = await screen.findByRole('button', { name: /Delete Task/i });
    fireEvent.click(deleteTaskButton);

    const confirmDeleteButton = screen.getByRole('button', { name: /Delete Task/i });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument();
    });
  });

  test('filters tasks by status', async () => {
        renderApp();
        const taskInput = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
        const addButton = screen.getByRole('button', { name: /^Add Task$/i });
    
        fireEvent.change(taskInput, { target: { value: 'Active Task' } });
        fireEvent.click(addButton);
    
        fireEvent.change(taskInput, { target: { value: 'Completed Task' } });
        fireEvent.click(addButton);

        const completeButton = await screen.findByRole('button', { name: /Mark as complete/i });
        fireEvent.click(completeButton);

        const filterSelect = screen.getByLabelText(/Filter by Status/i) as HTMLSelectElement;
        fireEvent.change(filterSelect, { target: { value: 'active' } });
    
        await waitFor(() => {
            expect(screen.getByText('Active Task')).toBeInTheDocument();
            expect(screen.queryByText('Completed Task')).not.toBeInTheDocument();
        });
    });

  test('shows error message when adding empty task', async () => {
    renderApp();
    const addButton = screen.getByRole('button', { name: /^Add Task$/i });

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Task description cannot be empty./i)).toBeInTheDocument();
    });
  });

  test('toggles dark mode', () => {
    renderApp();
    const themeToggleButton = screen.getByRole('button', { name: /Switch to dark mode/i });

    fireEvent.click(themeToggleButton);
    expect(localStorage.getItem('darkMode')).toBe('true');

    fireEvent.click(themeToggleButton);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });

  test('logout button calls logout function', () => {
    renderApp();
    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    fireEvent.click(logoutButton);
    expect(mockAuthContextValue.logout).toHaveBeenCalledTimes(1);
  });

  test('AI Error state displayed', async () => {
    renderApp();
    const aiInput = screen.getByLabelText(/Smart Task Description/i) as HTMLInputElement;
    const aiButton = screen.getByRole('button', { name: /Create Smart Task/i });

    fireEvent.change(aiInput, { target: { value: '' } });
    fireEvent.click(aiButton);
    await waitFor(() => {
        expect(screen.getByText(/AI Input is empty./i)).toBeInTheDocument();
    });

  });

  test('search tasks', async () => {
    renderApp();
    const taskInput = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add Task$/i });

    fireEvent.change(taskInput, { target: { value: 'Searchable Task' } });
    fireEvent.click(addButton);

    const searchInput = screen.getByLabelText(/Search Tasks/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'searchable' } });

    await waitFor(() => {
        expect(screen.getByText('Searchable Task')).toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
        expect(screen.queryByText('Searchable Task')).not.toBeInTheDocument();
    });
});

  test('adds a subtask', async () => {
    renderApp();
    const taskInput = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add Task$/i });

    fireEvent.change(taskInput, { target: { value: 'Task with Subtask' } });
    fireEvent.click(addButton);

    const subtaskInput = await screen.findByPlaceholderText(/Add subtask.../i) as HTMLInputElement;
    const addSubtaskButton = screen.getByRole('button', { name: /Add/i });

    fireEvent.change(subtaskInput, { target: { value: 'New Subtask' } });
    fireEvent.click(addSubtaskButton);

    await waitFor(() => {
        expect(screen.getByText('New Subtask')).toBeInTheDocument();
    });
});

});
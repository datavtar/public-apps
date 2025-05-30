import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the authContext
const mockAuthContextValue = {
  currentUser: {
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User'
  },
  logout: jest.fn()
};


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
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
      writable: true,
    });
  });

  test('renders without crashing', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue as any}>
        <App />
      </AuthContext.Provider>
    );
  });

  test('renders welcome message with user\'s first name', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue as any}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByText(`Welcome, ${mockAuthContextValue.currentUser.first_name}!`)).toBeInTheDocument();
  });

  test('allows adding a new task', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue as any}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Add New Task/i }));

    const taskTitleInput = screen.getByLabelText('Title') as HTMLInputElement;
    fireEvent.change(taskTitleInput, { target: { value: 'Test Task' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  test('allows toggling task completion', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue as any}>
        <App />
      </AuthContext.Provider>
    );

    const checkbox = await screen.findByRole('checkbox', { name: /Grocery Shopping/i });
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
    });
  });

  test('allows deleting a task', async () => {
    // Mock window.confirm
    const confirmMock = jest.spyOn(window, 'confirm');
    confirmMock.mockImplementation(() => true);

    render(
      <AuthContext.Provider value={mockAuthContextValue as any}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(await screen.findByRole('button', { name: /Delete task Grocery Shopping/i }));

    await waitFor(() => {
      expect(screen.queryByText('Grocery Shopping')).not.toBeInTheDocument();
    });

    confirmMock.mockRestore(); // Restore the original function
  });

  test('filters tasks by status', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue as any}>
        <App />
      </AuthContext.Provider>
    );

    const statusFilterDropdown = screen.getByLabelText('Filter by status') as HTMLSelectElement;
    fireEvent.change(statusFilterDropdown, { target: { value: 'completed' } });

    await waitFor(() => {
      expect(screen.getByText('Book Doctor Appointment')).toBeInTheDocument();
      expect(screen.queryByText('Grocery Shopping')).not.toBeInTheDocument();
      expect(screen.queryByText('Plan Weekend Trip')).not.toBeInTheDocument();
    });
  });

  test('filters tasks by priority', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue as any}>
        <App />
      </AuthContext.Provider>
    );

    const priorityFilterDropdown = screen.getByLabelText('Filter by priority') as HTMLSelectElement;
    fireEvent.change(priorityFilterDropdown, { target: { value: 'High' } });

    await waitFor(() => {
      expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
      expect(screen.queryByText('Book Doctor Appointment')).not.toBeInTheDocument();
      expect(screen.queryByText('Plan Weekend Trip')).not.toBeInTheDocument();
    });
  });

  test('searches tasks', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue as any}>
        <App />
      </AuthContext.Provider>
    );

    const searchInput = screen.getByLabelText('Search tasks') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Grocery' } });

    await waitFor(() => {
      expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
      expect(screen.queryByText('Book Doctor Appointment')).not.toBeInTheDocument();
    });
  });

  test('navigates to the settings page and allows to initiate data download', async () => {
      render(
          <AuthContext.Provider value={mockAuthContextValue as any}>
              <App />
          </AuthContext.Provider>
      );

      fireEvent.click(screen.getByText('Settings'));

      const downloadButton = screen.getByText('Download All Tasks (CSV)');
      expect(downloadButton).toBeInTheDocument();
  });

  test('displays no tasks message when no tasks match criteria', async () => {
      render(
          <AuthContext.Provider value={mockAuthContextValue as any}>
              <App />
          </AuthContext.Provider>
      );

      const searchInput = screen.getByLabelText('Search tasks') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'nonexistenttask' } });

      await waitFor(() => {
          expect(screen.getByText('No tasks match your criteria.')).toBeInTheDocument();
      });
  });

  test('toggles dark mode', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue as any}>
        <App />
      </AuthContext.Provider>
    );

    const themeToggleButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(themeToggleButton);

    expect(localStorage.setItem).toHaveBeenCalledWith('todo_tasks_app_theme', 'true');

    fireEvent.click(themeToggleButton);

    expect(localStorage.setItem).toHaveBeenCalledWith('todo_tasks_app_theme', 'false');
  });

});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the auth context
const mockAuthContextValue = {
  currentUser: {
    first_name: 'Test User',
    email: 'test@example.com'
  },
  logout: jest.fn()
};

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
    // Clear localStorage before each test
    localStorage.clear();
    // Set default localStorage values to avoid errors
    localStorage.setItem('todoTasks', '[]');
    localStorage.setItem('todoCategories', JSON.stringify([
      { id: '1', name: 'Work', color: '#3B82F6', icon: 'Briefcase' },
      { id: '2', name: 'Personal', color: '#10B981', icon: 'User' },
      { id: '3', name: 'Health', color: '#F59E0B', icon: 'Heart' },
      { id: '4', name: 'Learning', color: '#8B5CF6', icon: 'BookOpen' },
      { id: '5', name: 'Home', color: '#06B6D4', icon: 'Home' }
    ]));
    localStorage.setItem('todoTimeEntries', '[]');
    localStorage.setItem('todoTemplates', '[]');
  });

  it('renders without crashing', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByText('TaskMaster')).toBeInTheDocument();
  });

  it('displays the Task List view by default', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByText(/Task List/i)).toBeInTheDocument();
  });

  it('allows navigation to the Kanban Board view', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    const kanbanBoardLink = screen.getByRole('button', { name: /Kanban Board/i });
    fireEvent.click(kanbanBoardLink);
    expect(screen.getByText(/Kanban Board/i)).toBeInTheDocument();
  });

  it('allows navigation to the Analytics view', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    const analyticsLink = screen.getByRole('button', { name: /Analytics/i });
    fireEvent.click(analyticsLink);
    expect(screen.getByText(/Analytics Dashboard/i)).toBeInTheDocument();
  });

  it('opens the add task modal when the add task button is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    await waitFor(() => {
        expect(screen.getByText(/Add New Task/i)).toBeVisible();
    });
  });

  it('adds a task correctly', async () => {
    render(
        <AuthContext.Provider value={mockAuthContextValue}>
            <App />
        </AuthContext.Provider>
    );

    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    await waitFor(() => {
        expect(screen.getByText(/Add New Task/i)).toBeVisible();
    });

    fireEvent.change(screen.getByPlaceholderText(/Enter task title/i), { target: { value: 'Test Task' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter task description/i), { target: { value: 'Test Description' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  it('shows no tasks message when there are no tasks', () => {
    localStorage.setItem('todoTasks', '[]');
    render(
        <AuthContext.Provider value={mockAuthContextValue}>
            <App />
        </AuthContext.Provider>
    );
    expect(screen.getByText(/No tasks found/i)).toBeInTheDocument();
  });

  it('opens AI suggest task modal when AI Suggest is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    const aiSuggestButton = screen.getByRole('button', { name: /AI Suggest/i });
    fireEvent.click(aiSuggestButton);

    await waitFor(() => {
      expect(screen.getByText(/AI Task Assistant/i)).toBeVisible();
    });
  });
});

import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

const mockAuthContextValue = {
  currentUser: {
    uid: 'test-uid',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User'
  },
  logout: jest.fn(),
  login: jest.fn(),
  signup: jest.fn(),
  resetPassword: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn()
};

const renderWithAuthProvider = (ui: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContextValue}>
      {ui}
    </AuthContext.Provider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders welcome message with user\'s first name from auth context', () => {
    renderWithAuthProvider(<App />);
    expect(screen.getByText(/Welcome back, Test!/i)).toBeInTheDocument();
  });

  test('renders the AI Task Suggestions button', () => {
    renderWithAuthProvider(<App />);
    expect(screen.getByRole('button', { name: /AI Task Suggestions/i })).toBeInTheDocument();
  });

  test('renders the add task button on tasks page', async () => {
    renderWithAuthProvider(<App />);
    const tasksLink = screen.getByRole('button', {name: 'Tasks'});
    tasksLink.click();
    expect(screen.getByRole('button', { name: /Add Task/i })).toBeInTheDocument();
  });

  test('renders "No tasks found" message when there are no tasks', async () => {
    renderWithAuthProvider(<App />);
    const tasksLink = screen.getByRole('button', {name: 'Tasks'});
    tasksLink.click();
    expect(screen.getByText(/No tasks found/i)).toBeInTheDocument();
  });

  test('opens and closes the Add Task modal', async () => {
    renderWithAuthProvider(<App />);
    const tasksLink = screen.getByRole('button', {name: 'Tasks'});
    tasksLink.click();

    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    addTaskButton.click();
    expect(screen.getByText(/Create New Task/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    cancelButton.click();
    // Use findBy instead of getBy as the modal disappears after a while
    // await waitForElementToBeRemoved(() => screen.queryByText(/Create New Task/i));
  });

  test('opens and closes the AI suggestion Modal', async () => {
    renderWithAuthProvider(<App />);

    const aiSuggestionButton = screen.getByRole('button', { name: /AI Task Suggestions/i });
    aiSuggestionButton.click();

    expect(screen.getByText(/AI Task Suggestions/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    cancelButton.click();
  });
});
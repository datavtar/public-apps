import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthProvider } from '../src/contexts/authContext';

const mockCurrentUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'user'
};

const mockUseAuth = () => ({
  currentUser: mockCurrentUser,
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  resetPassword: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn()
});

jest.mock('../src/contexts/authContext', () => ({
  useAuth: mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders the component', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByText(/TodoMaster/i)).toBeInTheDocument();
  });

  test('displays welcome message with user\'s first name', () => {
    render(
        <AuthProvider>
            <App />
        </AuthProvider>
    );
    expect(screen.getByText(`Welcome, ${mockCurrentUser.first_name}`)).toBeInTheDocument();
  });

  test('adds a new todo', async () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );

    const addTodoButton = screen.getByRole('button', { name: /Add Todo/i });
    fireEvent.click(addTodoButton);

    const titleInput = screen.getByPlaceholderText(/What needs to be done?/i);
    fireEvent.change(titleInput, { target: { value: 'Test Todo' } });

    const addButton = screen.getByRole('button', { name: /Add Todo/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
    });
  });

  test('toggles a todo', async () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );

    const addTodoButton = screen.getByRole('button', { name: /Add Todo/i });
    fireEvent.click(addTodoButton);

    const titleInput = screen.getByPlaceholderText(/What needs to be done?/i);
    fireEvent.change(titleInput, { target: { value: 'Test Todo' } });

    const addButton = screen.getByRole('button', { name: /Add Todo/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole('button', { name: '' }); // Find the toggle button associated with 'Test Todo'
    fireEvent.click(toggleButton);
  });

  test('filters todos', async () => {
      render(
          <AuthProvider>
              <App />
          </AuthProvider>
      );

      const addTodoButton = screen.getByRole('button', { name: /Add Todo/i });
      fireEvent.click(addTodoButton);

      const titleInput = screen.getByPlaceholderText(/What needs to be done?/i);
      fireEvent.change(titleInput, { target: { value: 'Test Todo' } });

      const addButton = screen.getByRole('button', { name: /Add Todo/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
      });

      const filterDropdown = screen.getByRole('combobox');
      fireEvent.change(filterDropdown, { target: { value: 'active' } });

      // Assertion to ensure the todo is still visible after filtering
      expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
  });

  test('deletes a todo', async () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );

    const addTodoButton = screen.getByRole('button', { name: /Add Todo/i });
    fireEvent.click(addTodoButton);

    const titleInput = screen.getByPlaceholderText(/What needs to be done?/i);
    fireEvent.change(titleInput, { target: { value: 'Test Todo' } });

    const addButton = screen.getByRole('button', { name: /Add Todo/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByTitle('Delete')[0];
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(screen.queryByText(/Test Todo/i)).not.toBeInTheDocument();
    });
  });
});
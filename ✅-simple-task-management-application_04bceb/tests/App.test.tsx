import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the auth context
const mockAuthContextValue = {
  currentUser: { uid: 'test-user', email: 'test@example.com', first_name: 'Test' },
  logout: jest.fn(),
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

// Mock the AILayer component
jest.mock('../src/components/AILayer', () => {
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      return <div data-testid="ai-layer-mock">AILayer Mock</div>;
    }),
  };
});

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders the app with initial elements', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/AI To-Do Pro/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add new task manually/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search\.\.\./i)).toBeInTheDocument();
  });

  test('opens and closes the add task modal', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    const addTaskButton = screen.getByRole('button', { name: /add new task manually/i });
    fireEvent.click(addTaskButton);

    await waitFor(() => {
      expect(screen.getByText(/add new task/i)).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText(/add new task/i)).not.toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    const addTaskButton = screen.getByRole('button', { name: /add new task manually/i });
    fireEvent.click(addTaskButton);

    await waitFor(() => {
      expect(screen.getByText(/add new task/i)).toBeInTheDocument();
    });

    const taskDescriptionInput = screen.getByLabelText(/task description/i);
    fireEvent.change(taskDescriptionInput, { target: { value: 'Buy groceries' } });

    const saveTaskButton = screen.getByRole('button', { name: /add task/i });
    fireEvent.click(saveTaskButton);

    await waitFor(() => {
      expect(screen.getByText(/buy groceries/i)).toBeInTheDocument();
      expect(screen.queryByText(/add new task/i)).not.toBeInTheDocument();
    });
  });

  test('toggles task completion', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    const addTaskButton = screen.getByRole('button', { name: /add new task manually/i });
    fireEvent.click(addTaskButton);

    await waitFor(() => {
      expect(screen.getByText(/add new task/i)).toBeInTheDocument();
    });

    const taskDescriptionInput = screen.getByLabelText(/task description/i);
    fireEvent.change(taskDescriptionInput, { target: { value: 'Buy groceries' } });

    const saveTaskButton = screen.getByRole('button', { name: /add task/i });
    fireEvent.click(saveTaskButton);

    await waitFor(() => {
      expect(screen.getByText(/buy groceries/i)).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('button', { name: /mark as completed/i });
    fireEvent.click(completeButton);

    // Assert that it's marked completed (check the styling change if applicable in real tests)
  });

  test('deletes a task', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    const addTaskButton = screen.getByRole('button', { name: /add new task manually/i });
    fireEvent.click(addTaskButton);

    await waitFor(() => {
      expect(screen.getByText(/add new task/i)).toBeInTheDocument();
    });

    const taskDescriptionInput = screen.getByLabelText(/task description/i);
    fireEvent.change(taskDescriptionInput, { target: { value: 'Buy groceries' } });

    const saveTaskButton = screen.getByRole('button', { name: /add task/i });
    fireEvent.click(saveTaskButton);

    await waitFor(() => {
      expect(screen.getByText(/buy groceries/i)).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText(/buy groceries/i)).not.toBeInTheDocument();
    });
  });

  test('opens and closes the settings modal', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByText(/settings/i)).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', {name: /x/i});
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText(/settings/i)).not.toBeInTheDocument();
    });
  });

  test('ai layer mock is rendered', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('ai-layer-mock')).toBeInTheDocument();
  });
});
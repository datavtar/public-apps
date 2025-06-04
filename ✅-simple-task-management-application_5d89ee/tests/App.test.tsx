import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the useAuth hook
const mockUseAuth = {
  currentUser: {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
  },
  logout: jest.fn(),
};

jest.mock('../src/contexts/authContext', () => ({
  useAuth: () => mockUseAuth,
  AuthContext: {
    Provider: ({ children }: { children: React.ReactNode }) => (
      {children}
    ),
  },
}));

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

// Mock AILayer component
jest.mock('../src/components/AILayer', () => {
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      return <div data-testid=\"ai-layer-mock\">AILayer Mock</div>;
    }),
  };
});

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    // Set some initial data in localStorage to avoid empty states during initial render
    localStorage.setItem('todoApp_tasks', JSON.stringify([]));
    localStorage.setItem('todoApp_categories', JSON.stringify([]));
    localStorage.setItem('todoApp_settings', JSON.stringify({
      theme: 'light',
      defaultView: 'list',
      timeTracking: true,
      notifications: true,
      autoArchive: false,
      language: 'en',
      timezone: 'UTC'
    }));
  });

  test('renders welcome message with user\'s first name', () => {
    render(<App />);
    expect(screen.getByText(/Welcome back, Test!/i)).toBeInTheDocument();
  });

  test('renders the quick add task button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Quick Add Task/i })).toBeInTheDocument();
  });

  test('opens task modal when quick add task button is clicked', async () => {
    render(<App />);
    const addTaskButton = screen.getByRole('button', { name: /Quick Add Task/i });
    fireEvent.click(addTaskButton);
    expect(screen.getByText(/Create New Task/i)).toBeInTheDocument();
  });

  test('renders the Tasks navigation button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Tasks/i })).toBeInTheDocument();
  });

  test('renders AI Layer component', () => {
    render(<App />);
    expect(screen.getByTestId('ai-layer-mock')).toBeInTheDocument();
  });

  test('displays \"No tasks yet\" message when there are no tasks', () => {
    render(<App />);
    // Navigate to dashboard to see this message
    const dashboardNav = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardNav);

    expect(screen.getByText(/No tasks yet. Create your first task to get started!/i)).toBeInTheDocument();
  });

  test('opens AI modal when ai assistant button is clicked', async () => {
    render(<App />);
    const dashboardNav = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardNav);
    const aiAssistantButton = screen.getByRole('button', { name: /AI Assistant/i });
    fireEvent.click(aiAssistantButton);
    expect(screen.getByText(/AI Task Assistant/i)).toBeInTheDocument();
  });
});
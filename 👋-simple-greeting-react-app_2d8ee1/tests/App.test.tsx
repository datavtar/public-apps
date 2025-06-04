import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

const mockLogout = jest.fn();

const setup = (currentUser: any = null) => {
  return render(
    <AuthContext.Provider value={{ currentUser, logout: mockLogout }}>
      <App />
    </AuthContext.Provider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders the Hello World! message', () => {
    setup();
    expect(screen.getByText('Hello World!')).toBeInTheDocument();
  });

  test('renders generic greeting message when no user is logged in', () => {
    setup();
    expect(screen.getByText('Welcome to your new application. Please log in to continue.')).toBeInTheDocument();
  });

  test('renders user-specific greeting message when user is logged in', () => {
    const mockUser = { first_name: 'Test', username: 'testuser' };
    setup(mockUser);
    expect(screen.getByText('Welcome, Test! Glad to have you here.')).toBeInTheDocument();
  });

  test('renders user-specific greeting message with username when first_name is not available', () => {
    const mockUser = { username: 'testuser' };
    setup(mockUser);
    expect(screen.getByText('Welcome, testuser! Glad to have you here.')).toBeInTheDocument();
  });

  test('toggles theme when theme toggle button is clicked', () => {
    setup();
    const themeToggleButton = screen.getByRole('switch', { name: /Switch to dark mode/i });
    fireEvent.click(themeToggleButton);
    expect(localStorage.getItem('darkMode')).toBe('true');
    fireEvent.click(themeToggleButton);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });

  test('calls logout function when logout button is clicked', async () => {
    const mockUser = { first_name: 'Test' };
    setup(mockUser);
    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  test('renders the current date', () => {
      setup();
      expect(screen.getByText('Today is June 4, 2025')).toBeInTheDocument();
  });

  test('check dark mode classes are added to the document element', () => {
    setup();
    const themeToggleButton = screen.getByRole('switch', { name: /Switch to dark mode/i });
    fireEvent.click(themeToggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('check dark mode classes are removed from the document element', () => {
      setup();
      localStorage.setItem('darkMode', 'true');
      render(
          <AuthContext.Provider value={{ currentUser: null, logout: mockLogout }}>
              <App />
          </AuthContext.Provider>
      );
      const themeToggleButton = screen.getByRole('switch', { name: /Switch to light mode/i });
      fireEvent.click(themeToggleButton);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
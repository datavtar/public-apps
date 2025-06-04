import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });



describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders navigation bar', () => {
    render(<App />);
    expect(screen.getByText(/CTO Dashboard/i)).toBeInTheDocument();
  });

  test('renders dashboard view by default', () => {
    render(<App />);
    expect(screen.getByText(/Team Productivity/i)).toBeInTheDocument();
  });

  test('navigates to teams view', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Teams/i }));
    await waitFor(() => {
      expect(screen.getByText(/Engineering Teams/i)).toBeInTheDocument();
    });
  });

  test('navigates to projects view', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Projects/i }));
    await waitFor(() => {
      expect(screen.getByText(/Project Portfolio/i)).toBeInTheDocument();
    });
  });

  test('navigates to settings view', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));
    await waitFor(() => {
      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', {name: /switch to dark mode/i});
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('cto-theme')).toBe('dark');

  });

  test('adds a new team member', async () => {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: /Teams/i }));

      fireEvent.click(screen.getByRole('button', { name: /Add Team Member/i }));
      await waitFor(() => expect(screen.getByText(/Engineering Teams/i)).toBeInTheDocument());

    });

    test('analyzes team performance', async () => {
      render(<App />);
      const analyzeButton = screen.getByRole('button', { name: /Analyze Team Performance/i });
      fireEvent.click(analyzeButton);

    });



    test('filters projects by status', async () => {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: /Projects/i }));
      const selectElement = screen.getByRole('combobox');
      fireEvent.change(selectElement, { target: { value: 'active' } });
      await waitFor(() => expect(screen.getByText(/Project Portfolio/i)).toBeInTheDocument());
    });


  test('clears all data', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));
    const clearButton = screen.getByRole('button', { name: /Clear All Data/i });

    // Mock window.confirm to return true (confirm the deletion)
    const windowConfirmMock = jest.spyOn(window, 'confirm');
    windowConfirmMock.mockImplementation(() => true);

    fireEvent.click(clearButton);
    windowConfirmMock.mockRestore();
  });


});

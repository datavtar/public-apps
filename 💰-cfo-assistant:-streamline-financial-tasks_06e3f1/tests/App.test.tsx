import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

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

// Mock window.confirm
const originalConfirm = window.confirm;

beforeEach(() => {
  window.confirm = jest.fn(() => true); // Always return true for confirmation
  localStorageMock.clear(); // Clear localStorage before each test
});

afterEach(() => {
  window.confirm = originalConfirm;
});

describe('App Component', () => {
  test('renders CFO Dashboard title', () => {
    render(<App />);
    expect(screen.getByText(/CFO Dashboard/i)).toBeInTheDocument();
  });

  test('navigates to budget view when Budget link is clicked', async () => {
    render(<App />);
    const budgetLink = screen.getByText(/Budget/i);
    fireEvent.click(budgetLink);
    expect(screen.getByText(/Budget Management/i)).toBeInTheDocument();
  });

  test('adds a budget item', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Budget/i));
    fireEvent.click(screen.getByRole('button', { name: /Add Budget Item/i }));

    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Test Category' } });
    fireEvent.change(screen.getByLabelText(/Department/i), { target: { value: 'Test Department' } });
    fireEvent.change(screen.getByLabelText(/Planned Amount/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Actual Amount/i), { target: { value: '500' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Budget Item/i }));

    // Wait for the budget item to be added and displayed
    expect(await screen.findByText(/Test Category/i)).toBeInTheDocument();
  });

  test('exports budget data to CSV', () => {
    const mockExportToCSV = jest.fn();
    const originalExportToCSV = (App as any).prototype.exportToCSV; // Replace 'any' with proper type if available
    (App as any).prototype.exportToCSV = mockExportToCSV;

    render(<App />);
    fireEvent.click(screen.getByText(/Budget/i));
    fireEvent.click(screen.getByText(/Export/i));

    expect(mockExportToCSV).toHaveBeenCalled();

    (App as any).prototype.exportToCSV = originalExportToCSV;
  });

  test('shows expense management title', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Expenses/i));
    expect(screen.getByText(/Expense Management/i)).toBeInTheDocument();
  });

    test('adds an expense item', async () => {
      render(<App />);
      fireEvent.click(screen.getByText(/Expenses/i));
      fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));

      fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Expense' } });
      fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '500' } });
      fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Operations' } });
      fireEvent.change(screen.getByLabelText(/Submitted By/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/Department/i), { target: { value: 'Test Dept' } });

      fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));

      expect(await screen.findByText(/Test Expense/i)).toBeInTheDocument();
    });

    test('shows settings page title', async () => {
      render(<App />);
      fireEvent.click(screen.getByText(/Settings/i));
      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });

    test('toggles dark mode', async () => {
      render(<App />);

      const toggleButton = screen.getByRole('button', { name: /Switch to dark mode/i });
      fireEvent.click(toggleButton);

      expect(localStorageMock.getItem('cfo_dark_mode')).toBe('true');
    });

    test('clears all data after confirmation', async () => {
        render(<App />);
        fireEvent.click(screen.getByText(/Settings/i));
        const clearDataButton = screen.getByRole('button', { name: /Clear All Data/i });
        fireEvent.click(clearDataButton);

        expect(window.confirm).toHaveBeenCalled();
      });
});

import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});


// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('Household Budget Tracker')).toBeInTheDocument();
    expect(screen.getByText('Add Expense')).toBeInTheDocument();
    expect(screen.getByText('View Expenses')).toBeInTheDocument();
    expect(screen.getByText('Budgets')).toBeInTheDocument();
  });

  test('allows adding a new expense', () => {
    render(<App />);

    // Arrange
    fireEvent.click(screen.getByText('Add Expense'));

    // Act
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Expense' } });
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2024-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /^Add Expense$/i }));

    // Assert
    expect(screen.getByText('View Expenses')).toBeInTheDocument();
    fireEvent.click(screen.getByText('View Expenses'));
    expect(screen.getByText('Test Expense')).toBeInTheDocument();
  });

  test('displays error message if description is empty', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^Add Expense$/i }));
    expect(await screen.findByText('Please enter a description')).toBeVisible()
  });

  test('displays error message if amount is invalid', async () => {
        render(<App />);
        fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Expense' } });
        fireEvent.change(screen.getByLabelText('Amount'), { target: { value: 'abc' } });
        fireEvent.click(screen.getByRole('button', { name: /^Add Expense$/i }));
        expect(await screen.findByText('Please enter a valid amount')).toBeVisible()
  });

  test('allows deleting an expense', () => {
    render(<App />);

    // Arrange
    fireEvent.click(screen.getByText('Add Expense'));
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Expense' } });
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2024-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /^Add Expense$/i }));

    fireEvent.click(screen.getByText('View Expenses'));
    expect(screen.getByText('Test Expense')).toBeInTheDocument();

    // Act
    const deleteButton = screen.getByRole('button', { name: /Delete expense/i });
    fireEvent.click(deleteButton);

    // Assert
    expect(screen.queryByText('Test Expense')).toBeNull();
  });

  test('allows editing an expense', () => {
        render(<App />);
    
        // Arrange
        fireEvent.click(screen.getByText('Add Expense'));
        fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Original Expense' } });
        fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '50' } });
        fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2024-01-01' } });
        fireEvent.click(screen.getByRole('button', { name: /^Add Expense$/i }));
    
        fireEvent.click(screen.getByText('View Expenses'));
        expect(screen.getByText('Original Expense')).toBeInTheDocument();
    
        // Act
        const editButton = screen.getByRole('button', { name: /Edit expense/i });
        fireEvent.click(editButton);
    
        fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Updated Expense' } });
        fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '75' } });
        fireEvent.click(screen.getByRole('button', { name: /^Update Expense$/i }));
    
        // Assert
        fireEvent.click(screen.getByText('View Expenses'));
        expect(screen.queryByText('Original Expense')).toBeNull();
        expect(screen.getByText('Updated Expense')).toBeInTheDocument();
        expect(screen.getByText('$75.00')).toBeInTheDocument();
  });

  test('allows setting and updating budgets', () => {
    render(<App />);

    // Arrange & Act: Initial budget setup
    fireEvent.click(screen.getByText('Budgets'));
    fireEvent.click(screen.getByText('Edit Budgets'));

    fireEvent.change(screen.getByLabelText(/Groceries Budget/), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/Utilities Budget/), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText(/Miscellaneous Budget/), { target: { value: '100' } });

    fireEvent.click(screen.getByText('Save Budgets'));

    // Assert: Budgets are displayed
    expect(screen.getByText('$200.00')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });
});
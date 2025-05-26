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
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    clear() {
      store = {};
    },
    removeItem(key: string) {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});


beforeEach(() => {
  localStorageMock.clear();
});

test('renders Expense Tracker title', () => {
  render(<App />);
  expect(screen.getByText(/Expense Tracker/i)).toBeInTheDocument();
});

test('adds a new expense', async () => {
  render(<App />);

  // Open the modal
  const addButton = screen.getByRole('button', { name: /Add Expense/i });
  fireEvent.click(addButton);

  // Fill out the form
  fireEvent.change(screen.getByLabelText(/Title \*/i), { target: { value: 'Test Expense' } });
  fireEvent.change(screen.getByLabelText(/Amount \*/i), { target: { value: '50' } });
  fireEvent.change(screen.getByLabelText(/Date \*/i), { target: { value: '2024-01-01' } });

  // Submit the form
  const submitButton = screen.getByRole('button', { name: /Add Expense/i });
  fireEvent.click(submitButton);

  // Wait for the expense to be added
  await waitFor(() => {
    expect(screen.getByText(/Test Expense/i)).toBeInTheDocument();
    expect(screen.getByText(/\$50.00/i)).toBeInTheDocument();
  });
});

test('filters expenses by search term', async () => {
    render(<App />);
  
    // Add an expense
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    fireEvent.change(screen.getByLabelText(/Title \*/i), { target: { value: 'Grocery Shopping' } });
    fireEvent.change(screen.getByLabelText(/Amount \*/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Date \*/i), { target: { value: '2024-01-05' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    await waitFor(() => expect(screen.getByText(/Grocery Shopping/i)).toBeInTheDocument());
  
    // Search for the expense
    const searchInput = screen.getByPlaceholderText(/Search expenses.../i);
    fireEvent.change(searchInput, { target: { value: 'Grocery' } });
  
    // Assert that the expense is displayed
    expect(screen.getByText(/Grocery Shopping/i)).toBeVisible();
  
    // Search for a non-existent expense
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
  
    // Assert that no expenses are displayed
    await waitFor(() => expect(screen.queryByText(/Grocery Shopping/i)).toBeNull());
  });

test('filters expenses by category', async () => {
    render(<App />);

    // Add two expenses with different categories
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    fireEvent.change(screen.getByLabelText(/Title \*/i), { target: { value: 'Food Expense' } });
    fireEvent.change(screen.getByLabelText(/Amount \*/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Date \*/i), { target: { value: '2024-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    await waitFor(() => expect(screen.getByText(/Food Expense/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    fireEvent.change(screen.getByLabelText(/Title \*/i), { target: { value: 'Transportation Expense' } });
    fireEvent.change(screen.getByLabelText(/Amount \*/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/Date \*/i), { target: { value: '2024-01-02' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    await waitFor(() => expect(screen.getByText(/Transportation Expense/i)).toBeInTheDocument());

    // Filter by category
    fireEvent.change(screen.getByRole('combobox', { name: /All Categories/i }), { target: { value: 'Food & Dining' } });

    // Assert that only the expense with the selected category is displayed
    expect(screen.getByText(/Food Expense/i)).toBeVisible();
    expect(screen.queryByText(/Transportation Expense/i)).toBeNull();
  });

test('filters expenses by payment method', async () => {
    render(<App />);

    // Add two expenses with different payment methods
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    fireEvent.change(screen.getByLabelText(/Title \*/i), { target: { value: 'Cash Expense' } });
    fireEvent.change(screen.getByLabelText(/Amount \*/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Date \*/i), { target: { value: '2024-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    await waitFor(() => expect(screen.getByText(/Cash Expense/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    fireEvent.change(screen.getByLabelText(/Title \*/i), { target: { value: 'Credit Card Expense' } });
    fireEvent.change(screen.getByLabelText(/Amount \*/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/Date \*/i), { target: { value: '2024-01-02' } });
    fireEvent.change(screen.getByLabelText(/Payment Method/i), { target: { value: 'Credit Card' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    await waitFor(() => expect(screen.getByText(/Credit Card Expense/i)).toBeInTheDocument());

    // Filter by payment method
    fireEvent.change(screen.getByRole('combobox', { name: /All Methods/i }), { target: { value: 'Cash' } });

    // Assert that only the expense with the selected payment method is displayed
    expect(screen.getByText(/Cash Expense/i)).toBeVisible();
    expect(screen.queryByText(/Credit Card Expense/i)).toBeNull();
  });

test('edits an existing expense', async () => {
  render(<App />);

  // Add a new expense first
  fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
  fireEvent.change(screen.getByLabelText(/Title \*/i), { target: { value: 'Initial Expense' } });
  fireEvent.change(screen.getByLabelText(/Amount \*/i), { target: { value: '25' } });
  fireEvent.change(screen.getByLabelText(/Date \*/i), { target: { value: '2024-01-03' } });
  fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
  await waitFor(() => expect(screen.getByText(/Initial Expense/i)).toBeInTheDocument());

  // Edit the expense
  fireEvent.click(screen.getByRole('button', {name: /Edit expense/i}));

  // Update the form
  fireEvent.change(screen.getByLabelText(/Title \*/i), { target: { value: 'Updated Expense' } });
  fireEvent.change(screen.getByLabelText(/Amount \*/i), { target: { value: '75' } });

  // Submit the form
  const updateButton = screen.getByRole('button', { name: /Update Expense/i });
  fireEvent.click(updateButton);

  // Assert that the expense is updated
  await waitFor(() => expect(screen.getByText(/Updated Expense/i)).toBeInTheDocument());
  expect(screen.getByText(/\$75.00/i)).toBeInTheDocument();
});

test('deletes an expense', async () => {
  // Mock the window.confirm function
  const originalConfirm = window.confirm;
  window.confirm = jest.fn(() => true); // Always return true for confirmation

  render(<App />);

  // Add an expense to delete
  fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
  fireEvent.change(screen.getByLabelText(/Title \*/i), { target: { value: 'Expense to Delete' } });
  fireEvent.change(screen.getByLabelText(/Amount \*/i), { target: { value: '10' } });
  fireEvent.change(screen.getByLabelText(/Date \*/i), { target: { value: '2024-01-04' } });
  fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
  await waitFor(() => expect(screen.getByText(/Expense to Delete/i)).toBeInTheDocument());

  // Delete the expense
  fireEvent.click(screen.getByRole('button', {name: /Delete expense/i}));

  // Assert that the expense is removed
  await waitFor(() => expect(screen.queryByText(/Expense to Delete/i)).toBeNull());

  // Restore the original confirm function
  window.confirm = originalConfirm;
});

test('toggles dark mode', () => {
  render(<App />);

  // Check if dark mode is initially off
  const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
  expect(darkModeButton).toBeInTheDocument();

  // Toggle dark mode on
  fireEvent.click(darkModeButton);

  // Check if dark mode is now on
  const lightModeButton = screen.getByRole('button', { name: /Switch to light mode/i });
  expect(lightModeButton).toBeInTheDocument();

  // Toggle dark mode off
  fireEvent.click(lightModeButton);

  // Check if dark mode is now off
  expect(screen.getByRole('button', { name: /Switch to dark mode/i })).toBeInTheDocument();
});
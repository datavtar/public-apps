import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  it('renders the component', () => {
    render(<App />);
    expect(screen.getByText('Expense Tracker')).toBeInTheDocument();
  });

  it('opens and closes the modal', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add Expense/i });
    fireEvent.click(addButton);

    expect(screen.getByText('Add Expense')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    // Use queryByText instead of getByText because the modal should be removed from the DOM
    expect(screen.queryByText('Add Expense')).not.toBeInTheDocument();
  });

 it('adds a new expense', async () => {
    render(<App />);

    // Open the modal
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));

    // Fill in the form
    fireEvent.change(screen.getByRole('textbox', { name: /Description/i }), { target: { value: 'Test Expense' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Amount/i }), { target: { value: '100' } });

    // Save the expense
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    // Check if the expense is added to the table
    expect(screen.getByText('Test Expense')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('deletes an expense', async () => {
    render(<App />);

    // Open the modal and add an expense
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /Description/i }), { target: { value: 'Test Expense' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Amount/i }), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    // Delete the expense
    fireEvent.click(screen.getByRole('button', { name: /delete-expense-\d+/i }));

    // Check if the expense is removed from the table
    expect(screen.queryByText('Test Expense')).not.toBeInTheDocument();
  });

  it('filters expenses by description', async () => {
    render(<App />);

    // Add an expense
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /Description/i }), { target: { value: 'Test Expense' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Amount/i }), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    // Filter the expenses
    fireEvent.change(screen.getByRole('searchbox', { name: /search/i }), { target: { value: 'Test' } });

    // Check if the expense is still in the table
    expect(screen.getByText('Test Expense')).toBeInTheDocument();

    // Filter with a non-matching description
    fireEvent.change(screen.getByRole('searchbox', { name: /search/i }), { target: { value: 'NonMatching' } });

    // Check if the expense is removed from the table
    expect(screen.queryByText('Test Expense')).not.toBeInTheDocument();
  });

 it('toggles dark mode', async () => {
    render(<App />);

    const toggleButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(toggleButton);

    expect(localStorage.getItem('darkMode')).toBe('true');
  });

 it('sorts expenses by date', async () => {
    render(<App />);

    // Add two expenses with different dates
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /Description/i }), { target: { value: 'Expense 1' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Amount/i }), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /Description/i }), { target: { value: 'Expense 2' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Amount/i }), { target: { value: '50' } });
    // Set date for expense 2 to be earlier than expense 1
    fireEvent.click(screen.getByRole('textbox', {name: /date/i}));

    const prevMonthButton = screen.getByRole('button', {name: /prev-month/i});
    fireEvent.click(prevMonthButton);
    const day1 = screen.getAllByRole('button', {name: /1/i})[0];
    fireEvent.click(day1);

    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    // Sort by date in ascending order
    fireEvent.click(screen.getByRole('button', { name: /Date/ }));

    // Verify that the expenses are sorted correctly
    const firstExpense = screen.getAllByText(/Expense/i)[0];
    expect(firstExpense).toHaveTextContent('Expense 2');

    // Sort by date in descending order
    fireEvent.click(screen.getByRole('button', { name: /toggle-sort-order/i }));

    // Verify that the expenses are sorted correctly
    const firstExpenseDesc = screen.getAllByText(/Expense/i)[0];
    expect(firstExpenseDesc).toHaveTextContent('Expense 1');
  });
});
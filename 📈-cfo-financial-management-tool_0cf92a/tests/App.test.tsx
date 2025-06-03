import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Financial Dashboard/i)).toBeInTheDocument();
  });

  test('displays key metrics', () => {
    render(<App />);
    expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Expenses/i)).toBeInTheDocument();
  });

  test('navigates to expenses view when Expenses menu item is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: /Expenses/i}));
    await waitFor(() => {
      expect(screen.getByText(/Expense Management/i)).toBeInTheDocument();
    });
  });

    test('navigates to dashboard view when Dashboard menu item is clicked', async () => {
    render(<App />);
        fireEvent.click(screen.getByRole('button', {name: /Dashboard/i}));
    await waitFor(() => {
      expect(screen.getByText(/Financial Dashboard/i)).toBeInTheDocument();
    });
  });


  test('navigates to budget view when Budget menu item is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: /Budget/i}));
    await waitFor(() => {
      expect(screen.getByText(/Budget Overview/i)).toBeInTheDocument();
    });
  });

    test('navigates to cashflow view when Cash Flow menu item is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: /Cash Flow/i}));
    await waitFor(() => {
      expect(screen.getByText(/Cash Flow Analysis/i)).toBeInTheDocument();
    });
  });

    test('navigates to reports view when Reports menu item is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: /Reports/i}));
    await waitFor(() => {
      expect(screen.getByText(/Financial Reports/i)).toBeInTheDocument();
    });
  });

    test('navigates to scenarios view when Scenarios menu item is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: /Scenarios/i}));
    await waitFor(() => {
      expect(screen.getByText(/Scenario Analysis/i)).toBeInTheDocument();
    });
  });

    test('navigates to settings view when Settings menu item is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: /Settings/i}));
    await waitFor(() => {
      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });
  });

  
});
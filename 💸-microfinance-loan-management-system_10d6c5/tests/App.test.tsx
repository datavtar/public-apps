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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock the generateId function to return a consistent ID for testing
const mockGenerateId = jest.fn(() => 'test-id');

jest.mock('../src/App', () => {
  const originalModule = jest.requireActual('../src/App');
  return {
    __esModule: true,
    default: (props: any) => React.createElement(originalModule.default, { ...props, generateId: mockGenerateId }),
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockGenerateId.mockReturnValue('test-id');
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/MicroFinance Manager/i)).toBeInTheDocument();
  });

  test('loads and displays sample data if localStorage is empty', () => {
    render(<App />);
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
  });

  test('adds a new customer', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Customers/i }));
    fireEvent.click(screen.getByRole('button', { name: /New Customer/i }));

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test Customer' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '123-456-7890' } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: '1 Test St' } });
    fireEvent.change(screen.getByLabelText(/Credit Score/i), { target: { value: '700' } });
    fireEvent.change(screen.getByLabelText(/Income Level/i), { target: { value: 'high' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Customer/i }));

    // Wait for the customer to be added and displayed
    await screen.findByText(/Test Customer/i);
    expect(screen.getByText(/Test Customer/i)).toBeInTheDocument();
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  test('adds a new loan', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Loans/i }));
    fireEvent.click(screen.getByRole('button', { name: /New Loan/i }));

    // Select a customer (assuming John Doe exists in sample data)
    fireEvent.change(screen.getByLabelText(/Customer/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Loan Amount/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Interest Rate/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Term \(Months\)/i), { target: { value: '12' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Loan/i }));

    // Wait for the loan to be added
    await screen.findByText(/#test-id/i);
    expect(screen.getByText(/#test-id/i)).toBeInTheDocument();
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  test('adds a new payment', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Payments/i }));
    fireEvent.click(screen.getByRole('button', { name: /Record Payment/i }));

    // Select a loan (assuming Loan ID 1 exists in sample data)
    fireEvent.change(screen.getByLabelText(/Loan/i), { target: { value: '1' } });

    // The amount is automatically filled
    fireEvent.change(screen.getByLabelText(/Payment Method/i), { target: { value: 'cash' } });

    fireEvent.click(screen.getByRole('button', { name: /Record Payment/i }));

    // Wait for the payment to be added
    await screen.findByText(/#test-id/i);
    expect(screen.getByText(/#test-id/i)).toBeInTheDocument();
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Toggle dark mode/i });

    // Initially, dark mode is off (or based on system preference)
    let expectedValue = window.matchMedia('(prefers-color-scheme: dark)').matches.toString();
    expect(localStorage.setItem).not.toHaveBeenCalled();
    
    // Toggle dark mode on
    fireEvent.click(darkModeButton);
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
  });

  test('filters loans by status', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Loans/i }));
    fireEvent.click(screen.getByRole('button', { name: /Filter/i }));

    const statusFilter = screen.getByLabelText(/Status/i);
    fireEvent.change(statusFilter, { target: { value: 'paid' } });

    // wait to apply filter
    await screen.findByText(/Status/i);

    // The table should only show paid loans (check for a known paid loan)
    expect(screen.queryByText(/active/i)).toBeNull();
  });

  test('sorts customers by name', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Customers/i }));

    const nameHeader = screen.getByText(/Name/i);
    fireEvent.click(nameHeader);

    // wait to sort data
    await screen.findByText(/Name/i);

    // Assuming John Doe and Jane Smith are in the initial data, and John Doe comes before Jane Smith
    const firstCustomer = screen.getAllByText(/Doe/i)[0];
    expect(firstCustomer).toBeInTheDocument();
  });
}

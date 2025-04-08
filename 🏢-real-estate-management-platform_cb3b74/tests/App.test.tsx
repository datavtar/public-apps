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

// Mock window.confirm
global.confirm = jest.fn(() => true);

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Property Manager Pro/i)).toBeInTheDocument();
  });

  test('navigates to Tenants tab and adds a tenant', async () => {
    render(<App />);

    // Navigate to Tenants tab
    const tenantsTab = screen.getByText(/Tenants/i);
    fireEvent.click(tenantsTab);

    // Click "Add Tenant" button
    const addTenantButton = screen.getByRole('button', { name: /^Add Tenant$/i });
    fireEvent.click(addTenantButton);

    // Verify that the modal appears
    expect(screen.getByText(/Add New Tenant/i)).toBeVisible();
  });

  test('navigates to Properties tab and adds a property', async () => {
    render(<App />);

    // Navigate to Properties tab
    const propertiesTab = screen.getByText(/Properties/i);
    fireEvent.click(propertiesTab);

    // Click "Add Property" button
    const addPropertyButton = screen.getByRole('button', { name: /^Add Property$/i });
    fireEvent.click(addPropertyButton);

    // Verify that the modal appears
    expect(screen.getByText(/Add New Property/i)).toBeVisible();
  });

  test('navigates to Payments tab and adds a payment', async () => {
    render(<App />);

    // Navigate to Payments tab
    const paymentsTab = screen.getByText(/Payments/i);
    fireEvent.click(paymentsTab);

    // Click "Add Payment" button
    const addPaymentButton = screen.getByRole('button', { name: /^Add Payment$/i });
    fireEvent.click(addPaymentButton);

    // Verify that the modal appears
    expect(screen.getByText(/Add New Payment/i)).toBeVisible();
  });

  test('navigates to Maintenance tab and adds a request', async () => {
    render(<App />);

    // Navigate to Maintenance tab
    const maintenanceTab = screen.getByText(/Maintenance/i);
    fireEvent.click(maintenanceTab);

    // Click "Add Request" button
    const addRequestButton = screen.getByRole('button', { name: /^Add Request$/i });
    fireEvent.click(addRequestButton);

    // Verify that the modal appears
    expect(screen.getByText(/Add New Maintenance Request/i)).toBeVisible();
  });

  test('navigates to Expenses tab and adds an expense', async () => {
    render(<App />);

    // Navigate to Expenses tab
    const expensesTab = screen.getByText(/Expenses/i);
    fireEvent.click(expensesTab);

    // Click "Add Expense" button
    const addExpenseButton = screen.getByRole('button', { name: /^Add Expense$/i });
    fireEvent.click(addExpenseButton);

    // Verify that the modal appears
    expect(screen.getByText(/Add New Expense/i)).toBeVisible();
  });

  test('navigates to Reports tab', async () => {
    render(<App />);

    // Navigate to Reports tab
    const reportsTab = screen.getByText(/Reports/i);
    fireEvent.click(reportsTab);

    // Verify the reports heading appears
    expect(screen.getByText(/Financial Reports/i)).toBeVisible();
  });
});

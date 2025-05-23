import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
global.confirm = jest.fn(() => true);

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  localStorage.setItem('invoices', JSON.stringify([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      vendorName: 'TechCorp Solutions',
      vendorEmail: 'billing@techcorp.com',
      amount: 5500.00,
      dueDate: '2024-02-15',
      issueDate: '2024-01-15',
      status: 'sent',
      description: 'Monthly software licensing and support services',
      category: 'Software & Technology',
      paymentTerms: 'Net 30',
      taxAmount: 500.00,
      discount: 0,
      subtotal: 5000.00
    }
  ]));
});


test('renders invoice management heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Invoice Management/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders add invoice button', () => {
  render(<App />);
  const addButton = screen.getByRole('button', { name: /Add Invoice/i });
  expect(addButton).toBeInTheDocument();
});

test('opens and closes the modal', async () => {
  render(<App />);
  const addButton = screen.getByRole('button', { name: /Add Invoice/i });
  fireEvent.click(addButton);
  await waitFor(() => {
    expect(screen.getByText(/Add New Invoice/i)).toBeInTheDocument();
  });

  const closeButton = screen.getByRole('button', {name: 'Close modal'});
  fireEvent.click(closeButton);
  await waitFor(() => {
    expect(screen.queryByText(/Add New Invoice/i)).not.toBeInTheDocument();
  });
});

test('adds a new invoice', async () => {
  render(<App />);
  const addButton = screen.getByRole('button', { name: /Add Invoice/i });
  fireEvent.click(addButton);

  fireEvent.change(screen.getByLabelText(/Vendor Name/i), { target: { value: 'New Vendor' } });
  fireEvent.change(screen.getByLabelText(/Vendor Email/i), { target: { value: 'vendor@example.com' } });
  fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '100' } });
  fireEvent.change(screen.getByLabelText(/Issue Date/i), { target: { value: '2024-01-01' } });
  fireEvent.change(screen.getByLabelText(/Due Date/i), { target: { value: '2024-02-01' } });

  const createButton = screen.getByRole('button', { name: /Create Invoice/i });
  fireEvent.click(createButton);

  await waitFor(() => {
    expect(screen.queryByText(/Add New Invoice/i)).not.toBeInTheDocument();
  });

  expect(screen.getByText('New Vendor')).toBeInTheDocument();
});

test('deletes an invoice', async () => {
  render(<App />);
  
  const deleteButton = screen.getAllByTitle('Delete')[0];
  fireEvent.click(deleteButton);
  
  expect(global.confirm).toHaveBeenCalled();
});

test('filters invoices by status', async () => {
  render(<App />);

  const filterButton = screen.getByRole('button', { name: /Filters/i });
  fireEvent.click(filterButton);

  const statusFilter = screen.getByLabelText(/Status/i);
  fireEvent.change(statusFilter, { target: { value: 'sent' } });

  await waitFor(() => {
    expect(screen.getByText('sent')).toBeInTheDocument();
  });
});

test('toggles dark mode', async () => {
  render(<App />);
  const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i});
  fireEvent.click(darkModeButton);

  expect(localStorage.getItem('darkMode')).toBe('true');
});
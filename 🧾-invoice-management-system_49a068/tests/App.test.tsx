import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../src/App';

// Mock local storage
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

// Mock initial invoices for consistent test environment
const mockInitialInvoices = [
    {
        id: 'init_INV001',
        invoiceNumber: 'INV2024-001',
        clientName: 'Acme Corp',
        clientCompany: 'Acme Innovations Ltd.',
        clientEmail: 'contact@acme.com',
        clientAddress: '123 Main St, Anytown, USA 12345',
        invoiceDate: new Date(2024, 5, 15).toISOString().split('T')[0],
        dueDate: new Date(2024, 6, 15).toISOString().split('T')[0],
        items: [
            { id: 'item1', description: 'Web Design Services', quantity: 1, unitPrice: 1200 },
            { id: 'item2', description: 'Hosting (1 Year)', quantity: 1, unitPrice: 100 },
        ],
        totalAmount: 1300,
        status: 'Sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: 'Thank you for your business! Payment is due within 30 days.',
    }
];

beforeEach(() => {
  localStorageMock.clear();
  localStorageMock.setItem('datavtar_invoiceApp_invoices_v2', JSON.stringify(mockInitialInvoices));
});

test('renders the app without crashing', async () => {
  render(<App />);
  // Wait for loading to finish
  await waitFor(() => expect(screen.queryByText('Loading...')) .not.toBeInTheDocument());
  expect(screen.getByText('InvoiceManager Pro')).toBeInTheDocument();
});

test('displays invoices after loading', async () => {
    render(<App />);

    await waitFor(() => expect(screen.queryByText('Loading...')) .not.toBeInTheDocument());
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(screen.getByText('INV2024-001')).toBeInTheDocument();
});

test('displays error message when local storage is corrupted', async () => {
  localStorageMock.setItem('datavtar_invoiceApp_invoices_v2', 'invalid json');
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText('Failed to load invoices. Data might be corrupted.')).toBeInTheDocument();
  });
});

test('opens and closes the add invoice modal', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText('Loading...')) .not.toBeInTheDocument());

    const addButton = screen.getByRole('button', { name: /Add Invoice/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Invoice')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { 'aria-label': 'Close modal' });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Create New Invoice')).not.toBeInTheDocument();
    });
});
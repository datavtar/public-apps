import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('displays loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading Invoices...')).toBeInTheDocument();
  });

  test('displays error message when there is an error', async () => {
    const localStorageMock = (() => {
      let store: { [key: string]: string } = {};

      return {
        getItem: (key: string): string | null => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = String(value);
        },
        clear: () => {
          store = {};
        },
        removeItem: (key: string) => {
          delete store[key];
        },
      };
    })();

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    localStorage.setItem('invoiceManagementApp_invoices_v1', 'invalid json');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Could not save data. Changes might be lost upon refresh.')).toBeInTheDocument();
    });
  });

  test('adds a new invoice', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText('Loading Invoices...')).not.toBeInTheDocument());

    const newInvoiceButton = screen.getByRole('button', { name: /New Invoice/i });
    fireEvent.click(newInvoiceButton);

    const clientNameInput = screen.getByLabelText(/Client Name \*/i);
    fireEvent.change(clientNameInput, { target: { value: 'Test Client' } });

    const invoiceDateInput = screen.getByLabelText(/Invoice Date \*/i);
    fireEvent.change(invoiceDateInput, { target: { value: '2024-01-01' } });

    const dueDateInput = screen.getByLabelText(/Due Date \*/i);
    fireEvent.change(dueDateInput, { target: { value: '2024-01-15' } });

    const createInvoiceButton = screen.getByRole('button', { name: /Create Invoice/i });
    fireEvent.click(createInvoiceButton);

    await waitFor(() => expect(screen.getByText('Test Client')).toBeInTheDocument());
  });

  test('deletes an invoice', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText('Loading Invoices...')).not.toBeInTheDocument());

    const deleteButton = screen.getAllByTitle('Delete Invoice')[0];
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByRole('button', { name: /Delete Invoice/i });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => expect(screen.queryByTitle('Delete Invoice')).not.toBeInTheDocument());
  });

  test('filters invoices by status', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText('Loading Invoices...')).not.toBeInTheDocument());

    const statusFilterSelect = screen.getByLabelText(/Filter by Status/i);
    fireEvent.change(statusFilterSelect, { target: { value: 'Paid' } });

    await waitFor(() => {
      const paidInvoices = screen.getAllByText('Paid');
      expect(paidInvoices.length).toBeGreaterThan(0);
    });
  });

  test('searches invoices by client name', async () => {
      render(<App />);
      await waitFor(() => expect(screen.queryByText('Loading Invoices...')).not.toBeInTheDocument());

      const searchInput = screen.getByLabelText(/Search Invoices/i);
      fireEvent.change(searchInput, { target: { value: 'Tech Solutions Inc.' } });

      await waitFor(() => {
          expect(screen.getByText('Tech Solutions Inc.')).toBeInTheDocument();
      });
  });
});
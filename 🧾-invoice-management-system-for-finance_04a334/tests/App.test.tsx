import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


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




describe('App Component', () => {

  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem('invoices', JSON.stringify([
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        clientAddress: '123 Test St',
        amount: 100,
        dueDate: '2024-01-01',
        issueDate: '2024-01-01',
        status: 'sent',
        description: 'Test Invoice',
        items: [],
        taxRate: 0,
        discountRate: 0,
        notes: '',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ]));
  });

  test('renders the App component', () => {
    render(<App />);
    expect(screen.getByText(/InvoiceManager/i)).toBeInTheDocument();
  });

  test('displays the dashboard by default', () => {
    render(<App />);
    expect(screen.getByText(/Total Invoices/i)).toBeInTheDocument();
  });

  test('navigates to invoices view when invoices button is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Invoices/i));

    await waitFor(() => {
      expect(screen.getByText(/New Invoice/i)).toBeInTheDocument();
    });
  });

  test('navigates to analytics view when analytics button is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Analytics/i));

    await waitFor(() => {
      expect(screen.getByText(/Average Invoice Value/i)).toBeInTheDocument();
    });
  });

  test('adds a new invoice', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Invoices/i));
    fireEvent.click(screen.getByRole('button', { name: /New Invoice/i }));

    fireEvent.change(screen.getByLabelText(/Client Name/i), { target: { value: 'New Client' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Invoice/i }));

    await waitFor(() => {
      expect(screen.getByText(/New Client/i)).toBeInTheDocument();
    });
  });

  test('deletes an invoice', async () => {
      render(<App />);
      fireEvent.click(screen.getByText(/Invoices/i));

      const deleteButton = screen.getAllByTitle('Delete')[0];
      fireEvent.click(deleteButton);

      const confirmDeleteButton = screen.getByRole('button', {name: /Delete/i});
      fireEvent.click(confirmDeleteButton);

      await waitFor(() => {
          expect(screen.queryByText(/Test Client/i)).toBeNull();
      });
  });

  test('toggles dark mode', async () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', {name: /Toggle dark mode/i});
    fireEvent.click(darkModeButton);

    expect(localStorageMock.getItem('darkMode')).toBe('true');
  });


});
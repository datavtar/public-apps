import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});




describe('App Component', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  test('renders the App component', () => {
    render(<App />);
    expect(screen.getByText('InvoiceMaster')).toBeInTheDocument();
  });

  test('displays dashboard view initially', () => {
    render(<App />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('switches to invoices view when invoices button is clicked', async () => {
    render(<App />);
    const invoicesButton = screen.getByRole('button', { name: /invoices/i });

    fireEvent.click(invoicesButton);

    await waitFor(() => {
        expect(screen.getByText('Invoices')).toBeInTheDocument();
    });
  });

  test('adds a new invoice', async () => {
    render(<App />);

    const addInvoiceButton = screen.getByRole('button', { name: /Add Invoice/i });
    fireEvent.click(addInvoiceButton);

    const clientNameInput = screen.getByLabelText(/Client Name/i);
    fireEvent.change(clientNameInput, { target: { value: 'Test Client' } });

    const clientEmailInput = screen.getByLabelText(/Client Email/i);
    fireEvent.change(clientEmailInput, { target: { value: 'test@example.com' } });

    const descriptionInput = screen.getByPlaceholderText(/Item description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test Item' } });

    const quantityInput = screen.getByPlaceholderText('1');
    fireEvent.change(quantityInput, { target: { value: '2' } });

    const priceInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(priceInput, { target: { value: '10' } });

    const createInvoiceButton = screen.getByRole('button', { name: /Create Invoice/i });
    fireEvent.click(createInvoiceButton);

    await waitFor(() => {
        expect(screen.getByText('Invoices')).toBeInTheDocument();
    });
  });

  test('displays no invoices message when there are no invoices', () => {
    mockLocalStorage.setItem('InvoiceMaster_invoices', JSON.stringify([]));
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: /Invoices/i}))
    expect(screen.getByText('No Invoices Found')).toBeInTheDocument();
  });


  test('filters invoices by search term', async () => {
        const initialInvoices = [
            {
                id: '1', invoiceNumber: 'INV-2024-001', clientName: 'Acme Corp', clientEmail: 'contact@acme.com',
                invoiceDate: new Date(2024, 5, 15).toISOString(), dueDate: new Date(2024, 6, 15).toISOString(),
                items: [{ id: 'item1', description: 'Web Development', quantity: 10, price: 150 }],
                totalAmount: 1500, status: 'Sent'
            },
            {
                id: '2', invoiceNumber: 'INV-2024-002', clientName: 'Beta Solutions', clientEmail: 'info@beta.com',
                invoiceDate: new Date(2024, 5, 20).toISOString(), dueDate: new Date(2024, 6, 5).toISOString(), // Overdue example
                items: [{ id: 'item1', description: 'Consulting Hours', quantity: 5, price: 200 }],
                totalAmount: 1000, status: 'Overdue'
            }
        ];
        mockLocalStorage.setItem('InvoiceMaster_invoices', JSON.stringify(initialInvoices));

        render(<App />);
        fireEvent.click(screen.getByRole('button', {name: /Invoices/i}))
        const searchInput = screen.getByPlaceholderText(/Search by Invoice # or Client.../i);
        fireEvent.change(searchInput, { target: { value: 'Acme' } });

        await waitFor(() => {
            expect(screen.getByText('Acme Corp')).toBeInTheDocument();
            expect(() => screen.getByText('Beta Solutions')).toThrow(); // Beta Solutions should be filtered out
        });
    });

  test('displays error message when saving invoice fails', async () => {
        const originalConsoleError = console.error; // Store original console.error
        console.error = jest.fn(); // Mock console.error

        // Mock localStorage to simulate an error during setItem
        const localStorageMock = (() => {
            let store: { [key: string]: string } = {};
            return {
                getItem: (key: string): string | null => store[key] || null,
                setItem: (key: string, value: string) => {
                    // Simulate localStorage error
                    throw new Error('Failed to save to localStorage');
                },
                removeItem: (key: string) => delete store[key],
                clear: () => store = {},
            };
        })();
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true, // Make it writable so we can reset it later
        });

        render(<App />);
        fireEvent.click(screen.getByRole('button', {name: /Add Invoice/i}))

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/Client Name/i), { target: { value: 'Test Client' } });
        fireEvent.change(screen.getByLabelText(/Client Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Item description/i), { target: { value: 'Test Item' } });
        fireEvent.change(screen.getByPlaceholderText('1'), { target: { value: '1' } });
        fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '10' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Create Invoice/i }));

        // Wait for the error message to appear
        await waitFor(() => {
            expect(screen.getByText('Failed to save invoice. Please try again.')).toBeInTheDocument();
        });

        // Restore original console.error and localStorage
        console.error = originalConsoleError;
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
        });

    });


});
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

// Mock the AILayer component
jest.mock('../src/components/AILayer', () => {
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      return (
        <div data-testid="ai-layer">
          <button data-testid="ai-layer-send" onClick={() => {
            if (props.onResult) {
              props.onResult(JSON.stringify({
                invoiceNumber: 'INV-2024-TEST',
                vendorName: 'Test Vendor',
                issueDate: '2024-01-01',
                dueDate: '2024-01-31',
                subtotal: 100,
                tax: 10,
                total: 110,
                lineItems: [{
                  description: 'Test Item',
                  quantity: 1,
                  rate: 100,
                  amount: 100,
                }],
                notes: 'Test Notes'
              }));
            }
          }}>Send to AI</button>
        </div>
      );
    }),
  };
});


ddescribe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/InvoiceFlow/i)).toBeInTheDocument();
  });

  test('navigates to the invoices tab and opens the AI upload modal', async () => {
    render(<App />);

    // Navigate to Invoices tab
    fireEvent.click(screen.getByRole('button', { name: /Invoices/i }));

    // Open AI Upload modal
    fireEvent.click(screen.getByRole('button', { name: /AI Extract/i }));

    expect(screen.getByText(/AI Invoice Extraction/i)).toBeInTheDocument();
  });

  test('attempts AI extraction without selecting a file shows error', async () => {
    render(<App />);

     // Navigate to Invoices tab
    fireEvent.click(screen.getByRole('button', { name: /Invoices/i }));

    // Open AI Upload modal
    fireEvent.click(screen.getByRole('button', { name: /AI Extract/i }));

    // Attempt extraction without file
    fireEvent.click(screen.getByRole('button', { name: /Extract Data/i }));

    // Check error message
    await waitFor(() => {
      expect(screen.getByText(/Please select a file to process./i)).toBeInTheDocument();
    });
  });

  test('Navigates to the invoices tab and extracts data using AI', async () => {
    render(<App />);

    // Navigate to Invoices tab
    fireEvent.click(screen.getByRole('button', { name: /Invoices/i }));

    // Open AI Upload modal
    fireEvent.click(screen.getByRole('button', { name: /AI Extract/i }));

    // Select a mock file
    const file = new File(['(invoice data)'], 'invoice.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/Select File/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    
    //Check that Extract data button is enabled
    expect(screen.getByRole('button', { name: /Extract Data/i })).toBeEnabled();

    // Trigger AI Extraction
    fireEvent.click(screen.getByRole('button', { name: /Extract Data/i }));

    //Wait for create invoice
    await waitFor(()=>{
      expect(screen.getByRole('button', {name: /Create Invoice/i})).toBeInTheDocument();
    });
  });

   test('adds and removes line items in invoice modal', async () => {
      render(<App />);

      // Navigate to Invoices tab
      fireEvent.click(screen.getByRole('button', { name: /Invoices/i }));

      // Open invoice modal
      fireEvent.click(screen.getByRole('button', { name: /New Invoice/i }));

      // Add a line item
      fireEvent.click(screen.getByRole('button', { name: /^Add Item$/i }));
      expect(screen.getAllByPlaceholderText('Description').length).toBe(2);

      // Remove a line item
      const removeButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(removeButtons[0]);

       // Check the number of description inputs after removal
      await waitFor(() => {
        expect(screen.getAllByPlaceholderText('Description').length).toBe(1);
      });

    });

    test('creates a new vendor', async () => {
        render(<App />);

        // Navigate to Vendors tab
        fireEvent.click(screen.getByRole('button', { name: /Vendors/i }));

        // Open vendor modal
        fireEvent.click(screen.getByRole('button', { name: /New Vendor/i }));

        // Fill in vendor form
        fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'New Vendor Name' } });
        fireEvent.change(screen.getByLabelText(/Email \*/i), { target: { value: 'newvendor@example.com' } });

        // Save the vendor
        fireEvent.click(screen.getByRole('button', { name: /Create Vendor/i }));

       // Verify that the vendor is added to the list
        await waitFor(() => {
          expect(screen.getByText(/New Vendor Name/i)).toBeInTheDocument();
        });
    });
});

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
          {props.children}
          <button data-testid="send-to-ai-mock" onClick={() => {
            if (props.onResult) {
              props.onResult(JSON.stringify({
                invoiceNumber: 'INV-2024-004',
                clientName: 'Test Client',
                issueDate: '2024-01-01',
                dueDate: '2024-02-01',
                items: [{
                  description: 'Test Item',
                  quantity: 1,
                  rate: 100,
                  amount: 100
                }],
                subtotal: 100,
                taxRate: 10,
                taxAmount: 10,
                total: 110
              }));
            }
          }}>Send to AI</button>
        </div>
      );
    }),
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/InvoiceFlow/i)).toBeInTheDocument();
  });

  test('AI extraction flow', async () => {
    render(<App />);

    // Open AI Extract modal
    const aiExtractButton = screen.getByText(/AI Extract/i);
    fireEvent.click(aiExtractButton);

    // Simulate file upload
    const fileInput = screen.getByLabelText(/AI Extract/i).querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['(invoice data)'], 'invoice.pdf', { type: 'application/pdf' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: true // Make the property writable
    });

    fireEvent.change(fileInput);

    // Click the extract data button. Mocked AILayer component will handle the rest.
    const extractDataButton = screen.getByText(/Extract Data/i);
    fireEvent.click(extractDataButton);

    // Simulate AI processing and result. We mock this with a simple button click in the mocked AILayer.
    const sendToAiButton = screen.getByTestId('send-to-ai-mock');
    fireEvent.click(sendToAiButton);

    // Wait for invoice modal to appear
    await waitFor(() => {
      expect(screen.getByText(/Create Invoice/i)).toBeInTheDocument();
    });

    // Verify invoice data
    expect(screen.getByDisplayValue('INV-2024-004')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /payment terms/i })).toHaveValue('Net 30');

    // Close the invoice modal
    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);

    // Ensure AI modal is closed
    await waitFor(() => {
      expect(screen.queryByText(/AI Invoice Extraction/i)).not.toBeInTheDocument();
    });
  });

  test('adds a new client', async () => {
    render(<App />);

    // Navigate to Clients view
    const clientsButton = screen.getByText(/Clients/i);
    fireEvent.click(clientsButton);

    // Open new client modal
    const newClientButton = screen.getByRole('button', { name: /New Client/i });
    fireEvent.click(newClientButton);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'New Client Name' } });
    fireEvent.change(screen.getByLabelText(/Email \*/i), { target: { value: 'newclient@example.com' } });

    // Save the client
    const saveClientButton = screen.getByRole('button', { name: /Save Client/i });
    fireEvent.click(saveClientButton);

    // Wait for client to be added and modal to close
    await waitFor(() => {
      expect(screen.getByText(/New Client Name/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/New Client/i)).not.toBeInTheDocument();
  });
});
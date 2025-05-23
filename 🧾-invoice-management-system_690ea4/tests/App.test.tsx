import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock the AI Layer component
jest.mock('../src/components/AILayer', () => {
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      return (
        <div data-testid="ai-layer-mock">
          <button onClick={() => {
            if (props.onResult) {
              props.onResult('{"invoiceData": {"clientName": "Test Client", "clientEmail": "test@example.com"}, "items": []}');
            }
          }}>Simulate AI Result</button>
          {props.children}
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
    expect(screen.getByText(/Invoice Manager/i)).toBeInTheDocument();
  });

  test('displays total invoices stat', () => {
    render(<App />);
    expect(screen.getByText(/Total Invoices/i)).toBeInTheDocument();
  });

  test('displays total revenue stat', () => {
    render(<App />);
    expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
  });

  test('can switch to create invoice view', async () => {
    render(<App />);
    const newInvoiceButton = screen.getByRole('button', { name: /New Invoice/i });
    fireEvent.click(newInvoiceButton);
    await waitFor(() => {
      expect(screen.getByText(/Create New Invoice/i)).toBeInTheDocument();
    });
  });

  test('can create a new invoice', async () => {
    render(<App />);
    const newInvoiceButton = screen.getByRole('button', { name: /New Invoice/i });
    fireEvent.click(newInvoiceButton);

    await waitFor(() => {
        expect(screen.getByText(/Create New Invoice/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Client Name/i), { target: { value: 'Test Client' } });
    fireEvent.change(screen.getByLabelText(/Client Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Due Date/i), { target: { value: '2024-12-31' } });

    const addItemButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addItemButton);
    
    const createInvoiceButton = screen.getByRole('button', { name: /Create Invoice/i });
    fireEvent.click(createInvoiceButton);

    await waitFor(() => {
      expect(screen.getByText(/Test Client/i)).toBeInTheDocument();
    });
  });

  test('can search invoices', async () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/Search invoices/i);
    fireEvent.change(searchInput, { target: { value: 'Acme' } });

    await waitFor(() => {
        expect(screen.getByText(/Acme Corporation/i)).toBeInTheDocument();
    });
  });

  test('can filter invoices by status', async () => {
    render(<App />);
    const statusFilter = screen.getByRole('combobox');
    fireEvent.change(statusFilter, { target: { value: 'paid' } });

    await waitFor(() => {
        expect(screen.getByText(/paid/i)).toBeInTheDocument();
    });
  });

    test('ai assistant panel opens', async () => {
        render(<App />);
        const aiAssistantButton = screen.getByRole('button', { name: /AI Assistant/i });
        fireEvent.click(aiAssistantButton);

        await waitFor(() => {
            expect(screen.getByText(/AI Invoice Assistant/i)).toBeInTheDocument();
        });
    });

    test('ai assistant auto fills form', async () => {
        render(<App />);
        const aiAssistantButton = screen.getByRole('button', { name: /AI Assistant/i });
        fireEvent.click(aiAssistantButton);

        await waitFor(() => {
            expect(screen.getByText(/AI Invoice Assistant/i)).toBeInTheDocument();
        });

        const simulateAIResultButton = screen.getByText(/Simulate AI Result/i);
        fireEvent.click(simulateAIResultButton);

        await waitFor(() => {
            expect(screen.getByDisplayValue(/Test Client/i)).toBeInTheDocument();
        });
    });
});
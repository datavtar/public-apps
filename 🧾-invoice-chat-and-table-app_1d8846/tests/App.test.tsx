import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock local storage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
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
      const handleSendToAI = () => {
        if (props.prompt.includes('Invoice INV-123')) {
          props.onResult(JSON.stringify({
            invoiceNumber: 'INV-123',
            vendor: 'Acme Corp',
            amount: 500,
            dueDate: '2024-12-31',
            status: 'Pending'
          }));
        } else if (props.prompt.includes('no invoice')) {
          props.onResult(JSON.stringify({"message": "No invoice details found."}));
        } else if (props.prompt.includes('Error')) {
          props.onError('AI Processing Error');
        } else if (props.prompt === "") {
          return null;  // don't call onLoading or onResult initially
        } else {
          props.onResult(JSON.stringify({
              invoiceNumber: 'INV-456',
              vendor: 'Beta Corp',
              amount: 250,
              dueDate: '2024-11-30',
              status: 'Paid'
          }));
        }
        props.onLoading(false);
      };

      React.useImperativeHandle(ref, () => ({
        sendToAI: handleSendToAI,
      }));

      return <div data-testid="ailayer-mock">AILayer Mock</div>;
    }),
  };
});

describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading Your Invoice Assistant...')).toBeInTheDocument();
  });

  test('displays initial welcome message', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText('Loading Your Invoice Assistant...')).not.toBeInTheDocument());
    expect(screen.getByText('Welcome! Type a message containing invoice details (e.g., \"Invoice INV-123 from Acme Corp for $500 due 2024-12-31 status pending\") and I will try to extract them into the table.')).toBeInTheDocument();
  });

  test('adds a user message to the chat', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText('Loading Your Invoice Assistant...')).not.toBeInTheDocument());
    const inputElement = screen.getByRole('textbox', { name: /chat message input/i });
    fireEvent.change(inputElement, { target: { value: 'Hello' } });
    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);
    await waitFor(() => screen.getByText('Hello'));
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  test('parses invoice details and adds to table', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText('Loading Your Invoice Assistant...')).not.toBeInTheDocument());
    const inputElement = screen.getByRole('textbox', { name: /chat message input/i });
    fireEvent.change(inputElement, { target: { value: 'Invoice INV-123 from Acme Corp for $500 due 2024-12-31 status pending' } });
    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);

    await waitFor(() => expect(screen.getByText('Invoice INV-123 from Acme Corp for $500 due 2024-12-31 status pending')).toBeInTheDocument());

    await waitFor(() => screen.getByText('INV-123'));
    expect(screen.getByText('INV-123')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getByText('Dec 31, 2024')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  test('displays no invoices found message', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText('Loading Your Invoice Assistant...')).not.toBeInTheDocument());
    const searchInput = screen.getByRole('textbox', { name: /search invoices/i });
    fireEvent.change(searchInput, { target: { value: 'NonExistentInvoice' } });

    await waitFor(() => {
      expect(screen.getByText('No invoices found.')).toBeInTheDocument();
    });
  });

  test('handles AI error state', async () => {
        render(<App />);
        await waitFor(() => expect(screen.queryByText('Loading Your Invoice Assistant...')).not.toBeInTheDocument());
        const inputElement = screen.getByRole('textbox', { name: /chat message input/i });
        fireEvent.change(inputElement, { target: { value: 'Error' } });
        const sendButton = screen.getByRole('button', { name: /send message/i });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(screen.getByText(/AI Error:/i)).toBeInTheDocument();
        });
    });

  test('AI responds with no invoice', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText('Loading Your Invoice Assistant...')).not.toBeInTheDocument());
    const inputElement = screen.getByRole('textbox', { name: /chat message input/i });
    fireEvent.change(inputElement, { target: { value: 'no invoice' } });
    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
        expect(screen.getByText('I couldn\'t find any invoice details in your message.')).toBeInTheDocument();
    });
  });
});
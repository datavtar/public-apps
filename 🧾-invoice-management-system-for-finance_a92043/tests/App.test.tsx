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




describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('Invoice Manager')).toBeInTheDocument();
  });

  test('displays dashboard tab by default', () => {
    render(<App />);
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
  });

  test('switches to invoices tab when invoices link is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Invoices'));
    await waitFor(() => {
        expect(screen.getByPlaceholderText('Search invoices...')).toBeInTheDocument();
    })
  });

  test('switches to customers tab when customers link is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Customers'));
    await waitFor(() => {
        expect(screen.getByText('Add Customer')).toBeInTheDocument();
    })
  });

  test('switches to payments tab when payments link is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Payments'));
    await waitFor(() => {
      expect(screen.getByText('Payment History')).toBeInTheDocument();
    })
  });

  test('opens and closes the new invoice modal', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Invoices'));
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /^New Invoice$/i }));
    })
    await waitFor(() => {
      expect(screen.getByText('Create New Invoice')).toBeInTheDocument();
    })
    fireEvent.click(screen.getByLabelText('Close modal'));
    
  });

  test('opens and closes the new customer modal', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Customers'));
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /^Add Customer$/i }));
    })
    await waitFor(() => {
      expect(screen.getByText('Add New Customer')).toBeInTheDocument();
    })
    fireEvent.click(screen.getByLabelText('Close modal'));
  });

  test('opens and closes the AI Analysis modal', async () => {
      render(<App />);
      const aiAnalysisButton = screen.getByRole('button', { name: /AI Analysis/i });

      fireEvent.click(aiAnalysisButton);
      await waitFor(() => {
          expect(screen.getByText('AI Invoice Analysis')).toBeInTheDocument();
      })

      fireEvent.click(screen.getByLabelText('Close modal'));
  });

});
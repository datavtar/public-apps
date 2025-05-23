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

// Mock the generateInvoiceNumber function
jest.mock('../src/App', () => {
  const originalModule = jest.requireActual('../src/App');
  return {
    __esModule: true,
    ...originalModule,
    default: originalModule.default
  };
});

describe('App Component', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('Invoice Management')).toBeInTheDocument();
  });

  test('allows to create a new invoice', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /New Invoice/i }));

    await waitFor(() => {
      expect(screen.getByText('Create New Invoice')).toBeVisible();
    });

    fireEvent.change(screen.getByLabelText(/Client Name/i), { target: { value: 'Test Client' } });
    fireEvent.change(screen.getByLabelText(/Client Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Due Date/i), { target: { value: '2024-12-31' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Invoice/i }));

    await waitFor(() => {
      expect(screen.queryByText('Create New Invoice')).not.toBeVisible();
    });
    expect(screen.getByText(/Test Client/i)).toBeInTheDocument();
  });

  test('shows error message when required fields are missing', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /New Invoice/i }));

    await waitFor(() => {
      expect(screen.getByText('Create New Invoice')).toBeVisible();
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Invoice/i }));

    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    });
  });
});
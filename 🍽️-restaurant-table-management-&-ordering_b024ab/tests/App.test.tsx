import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'

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
    clear(): void {
      store = {};
    },
    removeItem(key: string): void {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});


beforeEach(() => {
  localStorage.clear();
});


test('renders RestaurantPro title on the selection screen', () => {
  render(<App />);
  expect(screen.getByText('RestaurantPro')).toBeInTheDocument();
});

test('navigates to manager login screen when Manager Portal is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Manager Portal'));
    expect(screen.getByText('Manager Login')).toBeInTheDocument();
});

test('navigates to customer seating screen when Customer Portal is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Customer Portal'));
    expect(screen.getByText('Already have an order code?')).toBeInTheDocument();
});

test('manager can login with correct credentials', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Manager Portal'));

    fireEvent.change(screen.getByPlaceholderText('Enter username'), { target: { value: 'manager' } });
    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
        expect(screen.getByText('Manager Portal')).toBeInTheDocument();
    });
});

test('customer can access order with demo code 1001', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Customer Portal'));

    fireEvent.change(screen.getByPlaceholderText('Enter 4-digit order code (try: 1001)'), { target: { value: '1001' } });
    fireEvent.click(screen.getByRole('button', { name: /Access Order/i }));

    await waitFor(() => {
        expect(screen.getByText('Menu')).toBeInTheDocument();
    });
});

test('manager can add a new table', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Manager Portal'));

    fireEvent.change(screen.getByPlaceholderText('Enter username'), { target: { value: 'manager' } });
    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    await waitFor(() => {
        expect(screen.getByText('Manager Portal')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Layout'));

    fireEvent.click(screen.getByRole('button', { name: /Add Table/i }));
    await waitFor(() => {
      expect(screen.getAllByText('4 seats').length).toBeGreaterThan(0);
    });
});

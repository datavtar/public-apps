import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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


beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('fruitVendorProducts', JSON.stringify([
    {
      id: '1',
      name: 'Apple',
      type: 'fruit',
      price: 120,
      quantity: 50,
      season: 'winter',
      date: '2025-01-15',
      notes: 'Fresh apples'
    }
  ]));
});


test('renders the component', () => {
  render(<App />);
  expect(screen.getByText('શાકભાજી અને ફળ વિક્રેતા એપ્લિકેશન')).toBeInTheDocument();
});

test('displays total items from localStorage', () => {
  render(<App />);
  expect(async () => {
    await screen.findByText('કુલ આઇટમ્સ (Total Items)');
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});

test('adds a new item', async () => {
  render(<App />);
  const addButton = screen.getByRole('button', { name: /નવી આઇટમ/i });

  fireEvent.click(addButton);

  const nameInput = screen.getByLabelText(/નામ \(Name\) \*/i) as HTMLInputElement;
  const priceInput = screen.getByLabelText(/ભાવ \(Price\) \*/i) as HTMLInputElement;
  const quantityInput = screen.getByLabelText(/જથ્થો \(Quantity\) \*/i) as HTMLInputElement;
  const dateInput = screen.getByLabelText(/તારીખ \(Date\) \*/i) as HTMLInputElement;

  fireEvent.change(nameInput, { target: { value: 'Orange' } });
  fireEvent.change(priceInput, { target: { value: '75' } });
  fireEvent.change(quantityInput, { target: { value: '60' } });
  fireEvent.change(dateInput, { target: { value: '2025-02-20' } });

  const addSubmitButton = screen.getByRole('button', { name: /ઉમેરો \(Add\)/i });

  fireEvent.click(addSubmitButton);

  // Wait for modal to close
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(localStorage.getItem('fruitVendorProducts')).toContain('Orange');
});

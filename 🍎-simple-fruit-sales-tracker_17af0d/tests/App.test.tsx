import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});


beforeEach(() => {
  localStorageMock.clear();
});


test('renders the component', () => {
  render(<App />);
  expect(screen.getByText(/Fruit Vendor Sales Tracker/i)).toBeInTheDocument();
});

test('displays initial dummy data', () => {
  render(<App />);
  expect(screen.getByText('Apple')).toBeInTheDocument();
  expect(screen.getByText('Carrot')).toBeInTheDocument();
  expect(screen.getByText('Banana')).toBeInTheDocument();
  expect(screen.getByText('Orange')).toBeInTheDocument();
  expect(screen.getByText('Tomato')).toBeInTheDocument();
});

test('adds a new product', async () => {
  render(<App />);

  const addProductButton = screen.getByRole('button', { name: /^Add Product$/i });
  fireEvent.click(addProductButton);

  const nameInput = screen.getByLabelText('Product Name');
  const priceInput = screen.getByLabelText('Price ($)');
  const quantityInput = screen.getByLabelText('Quantity');
  const dateInput = screen.getByLabelText('Sale Date');

  fireEvent.change(nameInput, { target: { value: 'Grapes' } });
  fireEvent.change(priceInput, { target: { value: '2.99' } });
  fireEvent.change(quantityInput, { target: { value: '10' } });
  fireEvent.change(dateInput, { target: { value: '2024-01-01' } });

  const addbutton = screen.getByRole('button', {name: 'Add Product'});

  fireEvent.click(addbutton);

  expect(screen.getByText('Grapes')).toBeInTheDocument();
});

test('edits an existing product', async () => {
  render(<App />);

  const editButton = screen.getAllByRole('button', {name: /Edit/i})[0];
  fireEvent.click(editButton);

  const nameInput = screen.getByLabelText('Product Name');
  fireEvent.change(nameInput, { target: { value: 'Updated Apple' } });

  const updateButton = screen.getByRole('button', {name: 'Update Product'});
  fireEvent.click(updateButton);

  expect(screen.getByText('Updated Apple')).toBeInTheDocument();
});

test('deletes an existing product', async () => {
  render(<App />);

  const deleteButton = screen.getAllByRole('button', {name: /Delete/i})[0];
  fireEvent.click(deleteButton);

  expect(screen.queryByText('Apple')).not.toBeInTheDocument();
});

test('filters products by category', async () => {
  render(<App />);

  const categoryFilter = screen.getByRole('combobox', { name: /Filter by category/i });
  fireEvent.change(categoryFilter, { target: { value: 'Vegetable' } });

  expect(screen.getByText('Carrot')).toBeInTheDocument();
  expect(screen.queryByText('Apple')).not.toBeInTheDocument();
});

test('filters products by season', async () => {
  render(<App />);

  const seasonFilter = screen.getByRole('combobox', { name: /Filter by season/i });
  fireEvent.change(seasonFilter, { target: { value: 'Summer' } });

  expect(screen.getByText('Banana')).toBeInTheDocument();
  expect(screen.queryByText('Apple')).not.toBeInTheDocument();
});

test('searches for a product', async () => {
  render(<App />);

  const searchInput = screen.getByPlaceholderText(/Search products/i);
  fireEvent.change(searchInput, { target: { value: 'Apple' } });

  expect(screen.getByText('Apple')).toBeInTheDocument();
  expect(screen.queryByText('Carrot')).not.toBeInTheDocument();
});
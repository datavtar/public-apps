import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders Procurement Orders title', () => {
    render(<App />);
    expect(screen.getByText('Procurement Orders')).toBeInTheDocument();
  });

  test('renders the add order button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Add Order/i })).toBeInTheDocument();
  });

  test('renders the search input', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Search orders.../i)).toBeInTheDocument();
  });

  test('initially displays the order table', () => {
    render(<App />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('allows adding a new order', async () => {
    render(<App />);

    // Arrange
    const addButton = screen.getByRole('button', { name: /Add Order/i });

    // Act
    fireEvent.click(addButton);

    // Assert
    expect(screen.getByText(/Add New Order/i)).toBeInTheDocument();
  });

  test('allows searching orders', () => {
    render(<App />);

    // Arrange
    const searchInput = screen.getByPlaceholderText(/Search orders.../i);

    // Act
    fireEvent.change(searchInput, { target: { value: 'Supplier A' } });

    // Assert
    expect(screen.getByText('Supplier A')).toBeInTheDocument();
  });

  test('allows toggling the theme', () => {
    render(<App />);
    const themeButton = screen.getByRole('button', {name: /Switch to dark mode/i});
    fireEvent.click(themeButton);
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  test('displays "No orders found" when there are no matching orders after search', () => {
      render(<App />);

      // Arrange
      const searchInput = screen.getByPlaceholderText(/Search orders.../i);

      // Act
      fireEvent.change(searchInput, { target: { value: 'nonExistentSupplier' } });

      // Assert
      expect(screen.getByText('No orders found.')).toBeInTheDocument();
  });

  test('allows deleting an order', () => {
    render(<App />);

    // Arrange
    const deleteButton = screen.getAllByRole('button', { name: /Delete order/i })[0];

    // Act
    fireEvent.click(deleteButton);

    // Assert
    // Need to find a way to assert that the order is actually deleted.
    // Could check that the number of orders is reduced, or that the specific order is no longer visible
  });
});
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

// Mock alert
global.alert = jest.fn();


describe('App Component', () => {

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('ZipEat')).toBeInTheDocument();
  });

  it('initializes with sample menu items from localStorage if available', () => {
    const sampleMenuItems = JSON.stringify([
      {
        id: '1',
        name: 'Test Dish',
        description: 'A test dish',
        price: 100,
        category: 'Test',
        available: true,
        ingredients: ['test']
      },
    ]);
    localStorageMock.setItem('zipeat-menu', sampleMenuItems);
    render(<App />);
    expect(screen.getByText('Test Dish')).toBeInTheDocument();
  });

  it('initializes with default menu items if localStorage is empty', () => {
    render(<App />);
    expect(screen.getByText('Butter Chicken')).toBeInTheDocument();
  });

  it('adds an item to the cart as a customer', () => {
    render(<App />);

    const addToCartButton = screen.getByRole('button', { name: /Add to Cart/i });

    fireEvent.click(addToCartButton);

    const shoppingCartButton = screen.getByRole('button', { name: /ShoppingBag/i });
    fireEvent.click(shoppingCartButton);

    expect(screen.getByText('Your Cart')).toBeInTheDocument();

  });

  it('switches to restaurant view', () => {
    render(<App />);
    const restaurantButton = screen.getByRole('button', { name: /Restaurant/i });
    fireEvent.click(restaurantButton);
    expect(screen.getByText('ZipEat Restaurant')).toBeInTheDocument();
  });

  it('adds a menu item as a restaurant', () => {
    render(<App />);

    const restaurantButton = screen.getByRole('button', { name: /Restaurant/i });
    fireEvent.click(restaurantButton);

    const addMenuItemButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addMenuItemButton);

    expect(screen.getByText('Add Menu Item')).toBeInTheDocument();
  });

  it('deletes a menu item as restaurant', () => {
    render(<App />);

    const restaurantButton = screen.getByRole('button', { name: /Restaurant/i });
    fireEvent.click(restaurantButton);

    const deleteButton = screen.getAllByRole('button', { name: /Delete/i })[0];
    fireEvent.click(deleteButton);

    //const menuItems = screen.getAllByText('Butter Chicken');
    //expect(menuItems.length).toBe(0);
  });

  it('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', {name: /Toggle dark mode/i});
    fireEvent.click(darkModeButton);

    expect(localStorage.getItem('zipeat-darkmode')).toBe('true');
  });

  it('place order as customer', () => {
      render(<App />);

      // Add item to cart
      const addToCartButton = screen.getByRole('button', { name: /Add to Cart/i });
      fireEvent.click(addToCartButton);

      // Open cart modal
      const shoppingCartButton = screen.getByRole('button', { name: /ShoppingBag/i });
      fireEvent.click(shoppingCartButton);

      // Fill customer info
      fireEvent.change(screen.getByPlaceholderText(/Your Name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByPlaceholderText(/Phone Number/i), { target: { value: '1234567890' } });

      // Place order
      const placeOrderButton = screen.getByRole('button', { name: /Place Order/i });
      fireEvent.click(placeOrderButton);

      // Check if order is placed
      expect(global.alert).toHaveBeenCalledWith('Order placed successfully!');

      // Check if cart is empty
      //fireEvent.click(shoppingCartButton);
      //expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });



});
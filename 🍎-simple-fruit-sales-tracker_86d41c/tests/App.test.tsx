import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


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

  test('renders Fruit Vendor Sales Tracker title', () => {
    render(<App />);
    expect(screen.getByText('Fruit Vendor Sales Tracker')).toBeInTheDocument();
  });

  test('adds a new product', async () => {
    render(<App />);

    // Open the modal
    const addButton = screen.getByRole('button', { name: /^Add Product$/i });
    fireEvent.click(addButton);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Product Name'), { target: { value: 'Apple' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Fruit' } });
    fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '1.99' } });
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Sale Date'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Season'), { target: { value: 'Winter' } });

    // Submit the form
    const addProductButton = screen.getByRole('button', { name: /^Add Product$/i });
    fireEvent.click(addProductButton);

    // Assert that the product is added to the table
    expect(await screen.findByText('Apple')).toBeInTheDocument();
  });

    test('edits an existing product', async () => {
    render(<App />);

    // Add a product first
    fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));
    fireEvent.change(screen.getByLabelText('Product Name'), { target: { value: 'Apple' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Fruit' } });
    fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '1.99' } });
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Sale Date'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Season'), { target: { value: 'Winter' } });
    fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));

    // Now edit the product
    const editButton = await screen.findByRole('button', { name: /^Edit Apple$/i });
    fireEvent.click(editButton);

    // Change the name
    fireEvent.change(screen.getByLabelText('Product Name'), { target: { value: 'Orange' } });

    // Submit the form
    const updateButton = screen.getByRole('button', { name: /^Update Product$/i });
    fireEvent.click(updateButton);

    // Assert that the product is updated in the table
    expect(await screen.findByText('Orange')).toBeInTheDocument();
  });

   test('deletes a product', async () => {
    render(<App />);

    // Add a product first
    fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));
    fireEvent.change(screen.getByLabelText('Product Name'), { target: { value: 'Apple' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Fruit' } });
    fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '1.99' } });
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Sale Date'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Season'), { target: { value: 'Winter' } });
    fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));

    // Delete the product
    const deleteButton = await screen.findByRole('button', { name: /^Delete Apple$/i });
    fireEvent.click(deleteButton);

    // Assert that the product is removed from the table
    expect(screen.queryByText('Apple')).toBeNull();
  });

    test('filters products by category', async () => {
      render(<App />);

      // Add two products, one fruit and one vegetable
      fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));
      fireEvent.change(screen.getByLabelText('Product Name'), { target: { value: 'Apple' } });
      fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Fruit' } });
      fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '1.99' } });
      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText('Sale Date'), { target: { value: '2024-01-01' } });
      fireEvent.change(screen.getByLabelText('Season'), { target: { value: 'Winter' } });
      fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));

      fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));
      fireEvent.change(screen.getByLabelText('Product Name'), { target: { value: 'Carrot' } });
      fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Vegetable' } });
      fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '0.99' } });
      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '20' } });
      fireEvent.change(screen.getByLabelText('Sale Date'), { target: { value: '2024-01-02' } });
      fireEvent.change(screen.getByLabelText('Season'), { target: { value: 'Winter' } });
      fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));

      // Filter by Fruit
      fireEvent.change(screen.getByLabelText('Filter by category'), { target: { value: 'Fruit' } });
      expect(await screen.findByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Carrot')).toBeNull();

      // Filter by Vegetable
      fireEvent.change(screen.getByLabelText('Filter by category'), { target: { value: 'Vegetable' } });
      expect(screen.queryByText('Apple')).toBeNull();
      expect(await screen.findByText('Carrot')).toBeInTheDocument();

      // Reset filter to All
      fireEvent.change(screen.getByLabelText('Filter by category'), { target: { value: 'All' } });
      expect(await screen.findByText('Apple')).toBeInTheDocument();
      expect(await screen.findByText('Carrot')).toBeInTheDocument();
    });

    test('filters products by season', async () => {
      render(<App />);

      // Add two products, one for winter and one for summer
      fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));
      fireEvent.change(screen.getByLabelText('Product Name'), { target: { value: 'Apple' } });
      fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Fruit' } });
      fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '1.99' } });
      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText('Sale Date'), { target: { value: '2024-01-01' } });
      fireEvent.change(screen.getByLabelText('Season'), { target: { value: 'Winter' } });
      fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));

      fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));
      fireEvent.change(screen.getByLabelText('Product Name'), { target: { value: 'Mango' } });
      fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Fruit' } });
      fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '2.99' } });
      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '5' } });
      fireEvent.change(screen.getByLabelText('Sale Date'), { target: { value: '2024-07-01' } });
      fireEvent.change(screen.getByLabelText('Season'), { target: { value: 'Summer' } });
      fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));

      // Filter by Winter
      fireEvent.change(screen.getByLabelText('Filter by season'), { target: { value: 'Winter' } });
      expect(await screen.findByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Mango')).toBeNull();

      // Filter by Summer
      fireEvent.change(screen.getByLabelText('Filter by season'), { target: { value: 'Summer' } });
      expect(screen.queryByText('Apple')).toBeNull();
      expect(await screen.findByText('Mango')).toBeInTheDocument();

      // Reset filter to All
      fireEvent.change(screen.getByLabelText('Filter by season'), { target: { value: 'All' } });
      expect(await screen.findByText('Apple')).toBeInTheDocument();
      expect(await screen.findByText('Mango')).toBeInTheDocument();
    });

    test('sorts products by name', async () => {
      render(<App />);

      // Add two products
      fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));
      fireEvent.change(screen.getByLabelText('Product Name'), { target: { value: 'Banana' } });
      fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Fruit' } });
      fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '0.59' } });
      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '15' } });
      fireEvent.change(screen.getByLabelText('Sale Date'), { target: { value: '2024-01-01' } });
      fireEvent.change(screen.getByLabelText('Season'), { target: { value: 'Winter' } });
      fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));

      fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));
      fireEvent.change(screen.getByLabelText('Product Name'), { target: { value: 'Apple' } });
      fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Fruit' } });
      fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '1.99' } });
      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText('Sale Date'), { target: { value: '2024-01-02' } });
      fireEvent.change(screen.getByLabelText('Season'), { target: { value: 'Winter' } });
      fireEvent.click(screen.getByRole('button', { name: /^Add Product$/i }));

      // Sort by name (ascending)
      const nameHeader = screen.getByRole('button', {name: /^Name/});
      fireEvent.click(nameHeader);
      const firstProductName = await screen.findAllByText(/Apple/i);
      expect(firstProductName[0]).toBeInTheDocument();

        // Sort by name (descending)
      fireEvent.click(nameHeader);
      const firstProductNameDesc = await screen.findAllByText(/Banana/i);
      expect(firstProductNameDesc[0]).toBeInTheDocument();

    });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('renders Inventory Manager title', () => {
    render(<App />);
    expect(screen.getByText(/Inventory Manager/i)).toBeInTheDocument();
  });

  test('opens and closes the Add Item modal', async () => {
    render(<App />);

    // Open the modal
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);
    expect(screen.getByText(/Add Inventory Item/i)).toBeVisible();

    // Close the modal
    const closeButton = screen.getByRole('button', { 'aria-label': 'Close modal' });
    fireEvent.click(closeButton);
    expect(screen.queryByText(/Add Inventory Item/i)).toBeNull();
  });

  test('adds a new inventory item', async () => {
    render(<App />);

    // Open the modal
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test Item' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Test Category' } });
    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Unit/i), { target: { value: 'pcs' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText(/Reorder Level/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Supplier Name/i), { target: { value: 'Test Supplier' } });
    fireEvent.change(screen.getByLabelText(/Cost/i), { target: { value: '25' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Add Inventory/i });
    fireEvent.click(submitButton);

    // Check if the item is added to the table
    expect(await screen.findByText(/Test Item/i)).toBeInTheDocument();
  });

  test('validates the add inventory form', async () => {
    render(<App />);

    // Open the modal
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);

    // Submit the form without filling it
    const submitButton = screen.getByRole('button', { name: /Add Inventory/i });
    fireEvent.click(submitButton);

    // Check if the error messages are displayed
    expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Category is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Unit is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Location is required/i)).toBeInTheDocument();
  });

  test('opens and closes the Edit Item modal', async () => {
    render(<App />);

     // Add a test item first
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Initial Item' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Initial Category' } });
    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Unit/i), { target: { value: 'pcs' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Initial Location' } });
    fireEvent.change(screen.getByLabelText(/Reorder Level/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Supplier Name/i), { target: { value: 'Test Supplier' } });
    fireEvent.change(screen.getByLabelText(/Cost/i), { target: { value: '25' } });

    const submitButton = screen.getByRole('button', { name: /Add Inventory/i });
    fireEvent.click(submitButton);

    const editButton = await screen.findByRole('button', {name: /Edit inventory/i});
    fireEvent.click(editButton);

    expect(screen.getByText(/Edit Inventory Item/i)).toBeVisible();

    const closeButton = screen.getByRole('button', { 'aria-label': 'Close modal' });
    fireEvent.click(closeButton);
    expect(screen.queryByText(/Edit Inventory Item/i)).toBeNull();

  });

  test('edits an existing inventory item', async () => {
    render(<App />);
     // Add a test item first
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Initial Item' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Initial Category' } });
    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Unit/i), { target: { value: 'pcs' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Initial Location' } });
    fireEvent.change(screen.getByLabelText(/Reorder Level/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Supplier Name/i), { target: { value: 'Test Supplier' } });
    fireEvent.change(screen.getByLabelText(/Cost/i), { target: { value: '25' } });

    const submitButton = screen.getByRole('button', { name: /Add Inventory/i });
    fireEvent.click(submitButton);

    const editButton = await screen.findByRole('button', {name: /Edit inventory/i});
    fireEvent.click(editButton);

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Updated Item' } });

    const updateButton = screen.getByRole('button', { name: /Update Inventory/i });
    fireEvent.click(updateButton);

    expect(await screen.findByText(/Updated Item/i)).toBeInTheDocument();

  });

  test('opens and closes the Delete Item modal', async () => {
    render(<App />);
     // Add a test item first
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Initial Item' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Initial Category' } });

    const submitButton = screen.getByRole('button', { name: /Add Inventory/i });
    fireEvent.click(submitButton);

    const deleteButton = await screen.findByRole('button', {name: /Delete inventory/i});
    fireEvent.click(deleteButton);

    expect(screen.getByText(/Confirm Deletion/i)).toBeVisible();

    const closeButton = screen.getByRole('button', { 'aria-label': 'Close modal' });
    fireEvent.click(closeButton);
    expect(screen.queryByText(/Confirm Deletion/i)).toBeNull();

  });

  test('deletes an existing inventory item', async () => {
        render(<App />);
     // Add a test item first
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Item to Delete' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Delete Category' } });

    const submitButton = screen.getByRole('button', { name: /Add Inventory/i });
    fireEvent.click(submitButton);

    const deleteButton = await screen.findByRole('button', {name: /Delete inventory/i});
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByRole('button', {name: /Delete/i});
    fireEvent.click(confirmDeleteButton);

    expect(screen.queryByText(/Item to Delete/i)).toBeNull();

  });

  test('opens and closes the Filter modal', () => {
    render(<App />);

    const filterButton = screen.getByRole('button', { name: /Filter/i });
    fireEvent.click(filterButton);

    expect(screen.getByText(/Filter Inventory/i)).toBeVisible();

    const closeButton = screen.getByRole('button', { 'aria-label': 'Close modal' });
    fireEvent.click(closeButton);
    expect(screen.queryByText(/Filter Inventory/i)).toBeNull();
  });

  test('filters inventory items by category', async () => {
      render(<App />);

      // Add two inventory items with different categories
      const addButton = screen.getByRole('button', { name: /Add Item/i });

      fireEvent.click(addButton);
      fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Item 1' } });
      fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Category A' } });
      fireEvent.click(screen.getByRole('button', { name: /Add Inventory/i }));

      fireEvent.click(addButton);
      fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Item 2' } });
      fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Category B' } });
      fireEvent.click(screen.getByRole('button', { name: /Add Inventory/i }));

      // Open the filter modal
      const filterButton = screen.getByRole('button', { name: /Filter/i });
      fireEvent.click(filterButton);

      // Select a category to filter by
      fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Category A' } });

      // Apply the filter
      fireEvent.click(screen.getByRole('button', { name: /Apply Filter/i }));

      // Check if only the items with the selected category are displayed
      expect(await screen.findByText(/Item 1/i)).toBeInTheDocument();
      expect(screen.queryByText(/Item 2/i)).toBeNull();
  });

  test('opens and closes the Import/Export modal', () => {
    render(<App />);

    const importExportButton = screen.getByRole('button', { name: /Import\/Export/i });
    fireEvent.click(importExportButton);

    expect(screen.getByText(/Import\/Export Inventory/i)).toBeVisible();

    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText(/Import\/Export Inventory/i)).toBeNull();
  });

  test('opens and closes the Dashboard modal', () => {
    render(<App />);

    const dashboardButton = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardButton);

    expect(screen.getByText(/Inventory Dashboard/i)).toBeVisible();

    const closeButton = screen.getByRole('button', { name: /Close Dashboard/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText(/Inventory Dashboard/i)).toBeNull();
  });
});
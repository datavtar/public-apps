import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/UK Warehouse Manager/i)).toBeInTheDocument();
  });

  test('renders the inventory table', () => {
    render(<App />);
    expect(screen.getByRole('columnheader', { name: /SKU/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Name/i })).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: 'PROD001'})).toBeInTheDocument();
  });

  test('opens and closes the add item form', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);
    expect(screen.getByText(/Add New Inventory Item/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    expect(screen.queryByText(/Add New Inventory Item/i)).not.toBeInTheDocument();
  });

  test('filters inventory items based on search term', async () => {
    render(<App />);
    const searchInput = screen.getByRole('textbox', { name: /Search inventory/i });

    fireEvent.change(searchInput, { target: { value: 'Wireless' } });

    expect(screen.getByRole('cell', { name: 'Wireless Headphones' })).toBeVisible();
    expect(screen.queryByRole('cell', { name: 'Cotton T-Shirt' })).not.toBeInTheDocument();
  });

  test('handles adding a new inventory item', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText(/SKU/i), { target: { value: 'NEWPROD' } });
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Product' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'New Category' } });
    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/Storage Location/i), { target: { value: 'New Location' } });

    const addItemButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addItemButton);

    expect(await screen.findByText(/New item added to inventory/i)).toBeVisible();
    expect(screen.getByRole('cell', { name: 'NEWPROD' })).toBeVisible();
  });

  test('handles editing an existing inventory item', async () => {
    render(<App />);

    const editButton = screen.getAllByRole('button', { name: /Edit Wireless Headphones/i })[0];
    fireEvent.click(editButton);

    expect(screen.getByText(/Edit Inventory Item/i)).toBeVisible();

    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '200' } });
    const updateItemButton = screen.getByRole('button', { name: /Update Item/i });
    fireEvent.click(updateItemButton);

    expect(await screen.findByText(/Inventory updated successfully/i)).toBeVisible();
  });

  test('handles deleting an inventory item', () => {
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);

    render(<App />);

    const deleteButton = screen.getAllByRole('button', {name: /Delete Wireless Headphones/i})[0];
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    window.confirm = originalConfirm;
  });

  test('toggles dark mode', () => {
    render(<App />);

    const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i});
    fireEvent.click(darkModeButton);
  });

  test('displays movements tab', () => {
    render(<App />);

    const movementsTabButton = screen.getByRole('button', {name: /Movements/i});
    fireEvent.click(movementsTabButton);

    expect(screen.getByText(/Inventory Movements/i)).toBeVisible();
  });

  test('opens movement form', () => {
    render(<App />);

    const recordMovementButton = screen.getAllByRole('button', {name: /Record movement for Wireless Headphones/i})[0];
    fireEvent.click(recordMovementButton);

    expect(screen.getByText(/Record Movement for Wireless Headphones/i)).toBeVisible();
  });

  test('record inbound movement', async () => {
    render(<App />);

    const recordMovementButton = screen.getAllByRole('button', {name: /Record movement for Wireless Headphones/i})[0];
    fireEvent.click(recordMovementButton);
    
    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Source \(Supplier\)/i), { target: { value: 'Supplier A' } });
    fireEvent.change(screen.getByLabelText(/Destination Location/i), { target: { value: 'Aisle A' } });

    const recordButton = screen.getByRole('button', { name: /Record Movement/i });
    fireEvent.click(recordButton);

    expect(await screen.findByText(/Inventory movement recorded/i)).toBeVisible();
  });

  test('record outbound movement', async () => {
    render(<App />);

    const recordMovementButton = screen.getAllByRole('button', {name: /Record movement for Wireless Headphones/i})[0];
    fireEvent.click(recordMovementButton);

    const typeSelect = screen.getByLabelText(/Movement Type/i);
    fireEvent.change(typeSelect, { target: { value: 'outbound' } });

    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Source Location/i), { target: { value: 'Aisle A' } });
    fireEvent.change(screen.getByLabelText(/Destination \(Customer\)/i), { target: { value: 'Customer A' } });

    const recordButton = screen.getByRole('button', { name: /Record Movement/i });
    fireEvent.click(recordButton);

    expect(await screen.findByText(/Inventory movement recorded/i)).toBeVisible();
  });

  test('displays dashboard tab', () => {
    render(<App />);

    const dashboardTabButton = screen.getByRole('button', {name: /Dashboard/i});
    fireEvent.click(dashboardTabButton);

    expect(screen.getByText(/Total Items/i)).toBeVisible();
  });
});
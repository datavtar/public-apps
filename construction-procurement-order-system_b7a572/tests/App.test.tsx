import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Procurement Order Management/i)).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    render(<App />);
    expect(screen.getByText(/No orders found matching your criteria/i)).toBeInTheDocument();
  });

  test('allows searching orders', async () => {
    render(<App />);

    // Wait for the data to load before proceeding with the test
    await waitFor(() => {
      expect(screen.queryByText(/No orders found matching your criteria/i)).toBeNull();
    });

    const searchInput = screen.getByRole('textbox', { name: /search orders/i });
    fireEvent.change(searchInput, { target: { value: 'Construction' } });

    expect(searchInput.value).toBe('Construction');
  });

  test('allows filtering by status', async () => {
    render(<App />);

    // Wait for the data to load before proceeding with the test
    await waitFor(() => {
      expect(screen.queryByText(/No orders found matching your criteria/i)).toBeNull();
    });

    const statusFilter = screen.getByRole('combobox', { name: /filter by status/i });
    fireEvent.change(statusFilter, { target: { value: 'approved' } });

    expect(statusFilter.value).toBe('approved');
  });

    test('allows filtering by priority', async () => {
    render(<App />);

    // Wait for the data to load before proceeding with the test
    await waitFor(() => {
      expect(screen.queryByText(/No orders found matching your criteria/i)).toBeNull();
    });

    const priorityFilter = screen.getByRole('combobox', { name: /filter by priority/i });
    fireEvent.change(priorityFilter, { target: { value: 'urgent' } });

    expect(priorityFilter.value).toBe('urgent');
  });

    test('opens and closes the add order modal', async () => {
    render(<App />);

    // Wait for the data to load before proceeding with the test
    await waitFor(() => {
      expect(screen.queryByText(/No orders found matching your criteria/i)).toBeNull();
    });

    const addButton = screen.getByRole('button', { name: /add order/i });
    fireEvent.click(addButton);

    expect(screen.getByText(/Order Number/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    });

  test('displays no orders message when there are no orders', async () => {
        render(<App />);

        await waitFor(() => {
          expect(screen.queryByText(/No orders found matching your criteria/i)).toBeNull();
        });

       const searchInput = screen.getByRole('textbox', { name: /search orders/i });
       fireEvent.change(searchInput, { target: { value: 'NonExistentProjectName' } });

       // give time for the orders to filter out
       await waitFor(() => {
              expect(screen.getByText(/No orders found matching your criteria/i)).toBeInTheDocument();
        }, {timeout: 3000});
   });
});
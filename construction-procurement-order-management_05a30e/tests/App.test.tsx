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

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(), // New
    removeEventListener: jest.fn(), // New
    dispatchEvent: jest.fn(),
  }))
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<App />);
  });

  it('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders orders after loading', async () => {
    render(<App />);
    jest.advanceTimersByTime(500);
    await waitFor(() => expect(screen.getByText('Cement')).toBeInTheDocument());
    expect(screen.getByText('Steel Rods')).toBeInTheDocument();
    expect(screen.getByText('Bricks')).toBeInTheDocument();
  });

  it('opens and closes the add order modal', async () => {
    render(<App />);
    jest.advanceTimersByTime(500);
    await waitFor(() => expect(screen.getByRole('button', { name: /^Add Order$/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /^Add Order$/i }));
    await waitFor(() => expect(screen.getByText('Add New Order')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByText('Add New Order')).not.toBeInTheDocument());
  });

    it('allows adding a new order', async () => {
        render(<App />);
        jest.advanceTimersByTime(500);
        await waitFor(() => expect(screen.getByRole('button', { name: /^Add Order$/i })).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: /^Add Order$/i }));
        await waitFor(() => expect(screen.getByText('Add New Order')).toBeInTheDocument());

        fireEvent.change(screen.getByLabelText(/Item/i), { target: { value: 'New Item' } });
        fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '50' } });
        fireEvent.change(screen.getByLabelText(/Supplier/i), { target: { value: 'New Supplier' } });
        fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'Approved' } });

        fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

        await waitFor(() => expect(screen.queryByText('Add New Order')).not.toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('New Item')).toBeInTheDocument());
    });

  it('opens and closes the edit order modal', async () => {
    render(<App />);
    jest.advanceTimersByTime(500);
    await waitFor(() => expect(screen.getAllByRole('button', { name: /^Edit$/i })[0]).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('button', { name: /^Edit$/i })[0]);
    await waitFor(() => expect(screen.getByText('Edit Order')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByText('Edit Order')).not.toBeInTheDocument());
  });

 it('allows editing an existing order', async () => {
        render(<App />);
        jest.advanceTimersByTime(500);
        await waitFor(() => expect(screen.getAllByRole('button', { name: /^Edit$/i })[0]).toBeInTheDocument());

        fireEvent.click(screen.getAllByRole('button', { name: /^Edit$/i })[0]);
        await waitFor(() => expect(screen.getByText('Edit Order')).toBeInTheDocument());

        fireEvent.change(screen.getByLabelText(/Item/i), { target: { value: 'Updated Item' } });
        fireEvent.click(screen.getByRole('button', { name: /Update/i }));

        await waitFor(() => expect(screen.queryByText('Edit Order')).not.toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Updated Item')).toBeInTheDocument());
    });


  it('allows deleting an order', async () => {
    render(<App />);
    jest.advanceTimersByTime(500);
    await waitFor(() => expect(screen.getAllByRole('button', { name: /^Delete$/i })[0]).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('button', { name: /^Delete$/i })[0]);

    await waitFor(() => expect(screen.queryByText('Cement')).not.toBeInTheDocument());
  });

   it('filters orders by search term', async () => {
        render(<App />);
        jest.advanceTimersByTime(500);
        await waitFor(() => expect(screen.getByRole('searchbox', { name: /searchInput/i })).toBeInTheDocument());

        fireEvent.change(screen.getByRole('searchbox', { name: /searchInput/i }), { target: { value: 'Cement' } });
        await waitFor(() => expect(screen.getByText('Cement')).toBeInTheDocument());
        expect(screen.queryByText('Steel Rods')).not.toBeInTheDocument();
    });

    it('filters orders by status', async () => {
        render(<App />);
        jest.advanceTimersByTime(500);
        await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Approved' } });
        await waitFor(() => expect(screen.getByText('Approved')).toBeInTheDocument());
        expect(screen.queryByText('Cement')).not.toBeInTheDocument();
    });

});

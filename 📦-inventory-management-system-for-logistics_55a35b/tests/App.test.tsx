import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock window.confirm
const originalConfirm = window.confirm;

beforeEach(() => {
  window.confirm = jest.fn(() => true); // Always confirm
  localStorageMock.clear();
});

afterEach(() => {
  window.confirm = originalConfirm;
});


test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Inventory Manager/i);
  expect(linkElement).toBeInTheDocument();
});

test('displays loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
});

test('renders the component without initial loading state after data loads', async () => {
    render(<App />);

    // Wait for the loading state to disappear. Adjust timeout as needed.
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // After the loading state is gone, check if inventory items are rendered.
    expect(screen.getByText(/Heavy Duty Wrench/i)).toBeInTheDocument();
  });

test('adds a new item to the inventory', async () => {
  render(<App />);

  // Wait for data to load
  await waitFor(() => screen.getByRole('button', { name: /Add Item/i }));

  // Open the modal
  fireEvent.click(screen.getByRole('button', { name: /Add Item/i }));

  // Fill out the form
  fireEvent.change(screen.getByLabelText(/Item Name/i), { target: { value: 'New Item' } });
  fireEvent.change(screen.getByLabelText(/SKU/i), { target: { value: 'NI-001' } });
  fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '10' } });
  fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'New Category' } });
  fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'New Location' } });

  // Submit the form
  fireEvent.click(screen.getByRole('button', { name: /Add Item/i }));

  // Wait for the modal to close and the item to be added
  await waitFor(() => {
    expect(screen.getByText(/New Item/i)).toBeInTheDocument();
  });
});

test('deletes an item from the inventory', async () => {
  render(<App />);

  // Wait for data to load and delete button to render
  await waitFor(() => screen.getByRole('button', { name: /Delete item Heavy Duty Wrench/i }));

  // Delete the item
  fireEvent.click(screen.getByRole('button', { name: /Delete item Heavy Duty Wrench/i }));

  // Wait for the item to be removed
  await waitFor(() => {
    expect(screen.queryByText(/Heavy Duty Wrench/i)).not.toBeInTheDocument();
  });
});

test('filters items by search term', async () => {
  render(<App />);

  // Wait for data to load
  await waitFor(() => screen.getByRole('textbox', {name: /Search/i}));

  // Search for "wrench"
  fireEvent.change(screen.getByRole('textbox', {name: /Search/i}), { target: { value: 'Wrench' } });

  // Verify that only the item containing "Wrench" is displayed
  await waitFor(() => {
    expect(screen.getByText(/Heavy Duty Wrench/i)).toBeInTheDocument();
    expect(screen.queryByText(/Safety Gloves/i)).not.toBeInTheDocument();
  });
});

test('toggles dark mode', async () => {
    render(<App />);

    // Wait for initial render
    await waitFor(() => screen.getByRole('switch', { name: /switch to light mode/i }));

    // Check initial state (light mode)
    expect(localStorageMock.getItem('darkMode')).toBeFalsy();
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Toggle to dark mode
    fireEvent.click(screen.getByRole('switch', { name: /switch to light mode/i }));

    // Check dark mode state
    expect(localStorageMock.getItem('darkMode')).toBe('true');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Toggle back to light mode
    fireEvent.click(screen.getByRole('switch', { name: /switch to dark mode/i }));

    // Check light mode state
    expect(localStorageMock.getItem('darkMode')).toBe('false');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
});


test('displays error message when localStorage fails to load', () => {
  // Mock localStorage to throw an error
  const localStorageMock = {
    getItem: jest.fn(() => {
      throw new Error('Failed to load from localStorage');
    }),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  render(<App />);

  // Use waitFor to give the component time to handle the error and render the message
  return waitFor(() => {
    expect(screen.getByText(/Failed to load inventory data/)).toBeInTheDocument();
  });
});


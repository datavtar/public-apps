import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

// Mock initial localStorage state
beforeEach(() => {
  localStorageMock.clear();
});


test('renders app title', () => {
  render(<App />);
  // Use waitFor to ensure the component has finished loading
  waitFor(() => {
    expect(screen.getByText(/હાર્વેસ્ટ સેલ્સ/i)).toBeInTheDocument();
  });
});

test('shows loading state initially', () => {
  render(<App />);
  expect(screen.getByText(/લોડ કરી રહ્યું છે.../i)).toBeInTheDocument();
});

test('renders error message when loading fails', async () => {
  // Mock localStorage to simulate loading failure
  localStorageMock.getItem = jest.fn(() => {
    throw new Error('Failed to load data');
  });

  const { rerender } = render(<App />);

  // Wait for the loading state to disappear and the error to appear
  await waitFor(() => {
    expect(screen.queryByText(/લોડ કરી રહ્યું છે.../i)).not.toBeInTheDocument();
  });

  // Re-render the component to trigger the error state
  rerender(<App />);

  await waitFor(() => {
    expect(screen.getByText(/ભૂલ: ડેટા લોડ કરવામાં નિષ્ફળ./i)).toBeInTheDocument();
  });
});

test('add new sale', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/લોડ કરી રહ્યું છે.../i)).not.toBeInTheDocument());

    // Open the add sale modal
    const addButton = screen.getByRole('button', { name: /નવું વેચાણ ઉમેરો/i });
    fireEvent.click(addButton);

    // Fill in the form
    const nameInput = screen.getByLabelText(/નામ/i);
    fireEvent.change(nameInput, { target: { value: 'ટેસ્ટ આઇટમ' } });

    const quantityInput = screen.getByLabelText(/જથ્થો/i);
    fireEvent.change(quantityInput, { target: { value: '2' } });

    const priceInput = screen.getByLabelText(/એકમ દીઠ ભાવ \(₹\)/i);
    fireEvent.change(priceInput, { target: { value: '50' } });

    const dateInput = screen.getByLabelText(/તારીખ/i);
    fireEvent.change(dateInput, { target: { value: '2024-01-01' } });

    // Submit the form
    const saveButton = screen.getByRole('button', { name: /સાચવો/i });
    fireEvent.click(saveButton);

    // Wait for the modal to close and the new sale to be added
    await waitFor(() => {
      expect(screen.getByText(/ટેસ્ટ આઇટમ/i)).toBeInTheDocument();
    });
});

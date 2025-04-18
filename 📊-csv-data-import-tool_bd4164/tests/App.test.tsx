import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock papaparse
jest.mock('papaparse', () => ({
  parse: jest.fn(),
}));

import Papa from 'papaparse';


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    (Papa.parse as jest.Mock).mockClear();
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Item Manager')).toBeInTheDocument();
  });

  test('displays initial items', () => {
    render(<App />);
    expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
    expect(screen.getByText('Office Chair')).toBeInTheDocument();
  });

  test('adds a new item', async () => {
    render(<App />);

    // Arrange
    const addButton = screen.getByRole('button', { name: /^Add Item$/i });

    // Act
    fireEvent.click(addButton);
    await waitFor(() => screen.getByLabelText('Name'));

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Item' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Test Category' } });
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '100' } });

    const saveButton = screen.getByRole('button', { name: /^Add Item$/i });
    fireEvent.click(saveButton);

    // Assert
    await waitFor(() => expect(screen.getByText('New Item')).toBeInTheDocument());
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  test('displays error message when localStorage is full', async () => {
    // Mock localStorage.setItem to throw an error
    const setItemMock = jest.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('localStorage is full');
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^Add Item$/i }));

    await waitFor(() => screen.getByLabelText('Name'));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Error Item' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Error Category' } });
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '100' } });
    const saveButton = screen.getByRole('button', { name: /^Add Item$/i });

    fireEvent.click(saveButton);
    await waitFor(() => expect(screen.getByText('Could not save items. Local storage might be full or disabled.')).toBeInTheDocument());

    setItemMock.mockRestore(); // Restore the original implementation
  });

  test('filters items based on search term', async () => {
    render(<App />);

    // Arrange
    const searchInput = screen.getByPlaceholderText('Search name or category...');

    // Act
    fireEvent.change(searchInput, { target: { value: 'Laptop' } });

    // Assert
    await waitFor(() => expect(screen.getByText('Laptop Pro')).toBeInTheDocument());
    expect(screen.queryByText('Office Chair')).not.toBeInTheDocument();
  });

  test('deletes an item', async () => {
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);

    render(<App />);
    expect(screen.getByText('Laptop Pro')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /Delete/i })[0]);

    await waitFor(() => expect(screen.queryByText('Laptop Pro')).not.toBeInTheDocument());

    window.confirm = originalConfirm;
  });

  test('imports items from CSV', async () => {
    const csvData = `name,category,value\nTest Item,Test Category,50`;
    const file = new File([csvData], 'test.csv', { type: 'text/csv' });

    const parseMock = Papa.parse as jest.Mock;
    parseMock.mockImplementation((file: File, config: any) => {
      config.complete({
        data: [{
          name: 'Test Item',
          category: 'Test Category',
          value: '50',
        }],
        meta: { fields: ['name', 'category', 'value'] },
      });
    });

    render(<App />);
    const input = screen.getByLabelText(/Import items from CSV file/i) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(parseMock).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('Test Item')).toBeInTheDocument());

  });

  test('shows error when CSV import fails', async () => {
      const file = new File(['invalid csv'], 'test.csv', { type: 'text/csv' });

      const parseMock = Papa.parse as jest.Mock;
      parseMock.mockImplementation((file: File, config: any) => {
          config.error(new Error('CSV Parse Error'));
      });

      render(<App />);
      const input = screen.getByLabelText(/Import items from CSV file/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => expect(screen.getByText(/Error parsing CSV/i)).toBeInTheDocument());
  });

  test('toggles dark mode', async () => {
    render(<App />);
    const toggleButton = screen.getByRole('switch')

    // Initially light mode
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    // Toggle to dark mode
    fireEvent.click(toggleButton)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    // Toggle back to light mode
    fireEvent.click(toggleButton)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  test('sorts items by name', async () => {
    render(<App />);
    const nameHeader = screen.getByRole('button', {name: /Name SortAsc/i})
    fireEvent.click(nameHeader)

    const firstItem = await screen.findAllByText(/Coffee Mug/i)

    expect(firstItem[0]).toBeInTheDocument()
  })
});
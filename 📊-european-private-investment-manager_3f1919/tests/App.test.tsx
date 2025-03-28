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

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
  });

  it('displays the Investment Portfolio Manager title', () => {
    render(<App />);
    expect(screen.getByText('Investment Portfolio Manager')).toBeInTheDocument();
  });

  it('navigates to the Investments tab by default', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Investments' })).toHaveClass('btn-primary');
  });

  it('renders the Add New Investment form', () => {
    render(<App />);
    expect(screen.getByText('Add New Investment')).toBeInTheDocument();
  });

  it('adds a new investment', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Investment Name'), { target: { value: 'Test Investment' } });
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText('Investment Date'), { target: { value: '2024-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Investment' }));

    await waitFor(() => {
      expect(screen.getByText('Investment added successfully')).toBeInTheDocument();
    });
    expect(screen.getByText('Test Investment')).toBeInTheDocument();
  });
  
  it('updates an investment', async () => {
    render(<App />);

    // Find the first Edit button and click it
    const editButtons = await screen.findAllByRole('button', { name: /^Edit/ });
    fireEvent.click(editButtons[0]);

    // Change the investment name
    fireEvent.change(screen.getByLabelText('Investment Name'), { target: { value: 'Updated Investment' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Investment' }));

    await waitFor(() => {
        expect(screen.getByText('Investment updated successfully')).toBeInTheDocument();
    });

    // Check if the investment was updated
    expect(screen.getByText('Updated Investment')).toBeInTheDocument();

  });


  it('deletes an investment', async () => {
    const { container } = render(<App />);
    window.confirm = jest.fn(() => true); // Mock confirm

    const deleteButtons = await screen.findAllByRole('button', { name: /^Delete/ });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Investment deleted successfully')).toBeInTheDocument();
    });
  });

  it('filters investments by name', async () => {
      render(<App />);

      const searchInput = screen.getByPlaceholderText('Search investments...');
      fireEvent.change(searchInput, { target: { value: 'DAX' } });

      await waitFor(() => {
          expect(screen.getByText('DAX Index Fund')).toBeVisible();
      });
  });

});
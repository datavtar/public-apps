import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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



describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/PE Manager/i)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).	oBeInTheDocument();
  });

  it('renders Dashboard view after loading', async () => {
      render(<App />);
      await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument(), {timeout: 1000});
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('renders error state when localStorage fails to load', async () => {
    // Mock localStorage getItem to throw an error
    const localStorageGetItemMock = jest.spyOn(window.localStorage, 'getItem');
    localStorageGetItemMock.mockImplementation(() => {
      throw new Error('Failed to load from localStorage');
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load saved data/i)).toBeInTheDocument();
    }, { timeout: 1000 });

    localStorageGetItemMock.mockRestore(); // Restore the original getItem mock
  });


  it('navigates to Funds view when Funds button is clicked', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument(), {timeout: 1000});
    const fundsButton = screen.getByRole('button', { name: /Funds/i });
    fundsButton.click();
    expect(screen.getByText(/Funds/i)).toBeInTheDocument();
  });

  it('navigates to Investments view when Investments button is clicked', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument(), {timeout: 1000});
    const investmentsButton = screen.getByRole('button', { name: /Investments/i });
    investmentsButton.click();
    expect(screen.getByText(/Investments/i)).toBeInTheDocument();
  });
});
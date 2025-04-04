import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage to avoid errors during testing
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    clear() {
      store = {};
    },
    removeItem(key: string) {
      delete store[key];
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
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});



test('renders the component without crashing', () => {
  render(<App />);
});

test('renders loading state', () => {
  render(<App />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

test('renders error state when localStorage is corrupted', async () => {
  localStorage.setItem('pmCvData', 'invalid json');

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/failed to load cv data/i)).toBeInTheDocument();
  });
});

test('renders profile section with name and title', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText(/Alex Chen/i)).toBeInTheDocument();
    expect(screen.getByText(/Senior Product Manager/i)).toBeInTheDocument();
  });
});

test('renders experience section', async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/Career Experience/i)).toBeInTheDocument();
  });

});

test('renders at least one experience role', async () => {
    render(<App />);

    await waitFor(() => {
        expect(screen.getByText(/Senior Product Manager/i)).toBeInTheDocument();
    });
});


test('renders the explore button for experiences', async () => {
  render(<App />);

  await waitFor(() => {
    const exploreButtons = screen.getAllByRole('button', { name: /explore/i });
    expect(exploreButtons.length).toBeGreaterThan(0);
  });
});

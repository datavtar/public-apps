import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<App />);
  });

  it('displays the dashboard by default', async () => {
    render(<App />);
    // Wait for data to load.  Using a more specific selector to avoid timing issues.
    await waitFor(() => screen.getByText(/Fund Summary/i))
    expect(screen.getByText(/Fund Summary/i)).toBeInTheDocument();
  });

  it('navigates to the Funds view when the Funds button is clicked', async () => {
    render(<App />);
    // Wait for data to load
    await waitFor(() => screen.getByText(/Fund Summary/i))
    fireEvent.click(screen.getByText(/Funds/i));
    await waitFor(() => expect(screen.getByText(/Funds Overview/i)).toBeInTheDocument());
  });

  it('navigates to the Portfolio Companies view when the Portfolio Companies button is clicked', async () => {
    render(<App />);
    // Wait for data to load
     await waitFor(() => screen.getByText(/Fund Summary/i))
    fireEvent.click(screen.getByText(/Portfolio Companies/i));
    await waitFor(() => expect(screen.getByText(/Portfolio Companies/i)).toBeInTheDocument());
  });

  it('allows searching funds', async () => {
    render(<App />);
    // Wait for data to load
     await waitFor(() => screen.getByText(/Fund Summary/i))
    fireEvent.click(screen.getByText(/Funds/i));
    const searchInput = screen.getByPlaceholderText(/Search funds.../i);
    fireEvent.change(searchInput, { target: { value: 'Fund 1' } });
    await waitFor(() => expect(screen.getByText(/Fund 1/i)).toBeInTheDocument());
  });

 it('allows adding a new fund', async () => {
  render(<App />);
  await waitFor(() => screen.getByText(/Fund Summary/i));
  fireEvent.click(screen.getByText(/Funds/i));
  fireEvent.click(screen.getByRole('button', { name: /^Add Fund$/i }));
  
  fireEvent.change(screen.getByLabelText(/Fund Name/i), { target: { value: 'New Fund' } });
  fireEvent.change(screen.getByLabelText(/Strategy/i), { target: { value: 'Buyout' } });
  fireEvent.change(screen.getByLabelText(/Vintage Year/i), { target: { value: '2023' } });
  fireEvent.change(screen.getByLabelText(/AUM \(\$M\)/i), { target: { value: '100' } });
  fireEvent.change(screen.getByLabelText(/IRR \(\%\)/i), { target: { value: '10' } });
  fireEvent.change(screen.getByLabelText(/MOIC \(x\)/i), { target: { value: '1.5' } });
  fireEvent.change(screen.getByLabelText(/Commitments \(\$M\)/i), { target: { value: '110' } });
  fireEvent.change(screen.getByLabelText(/Called Capital \(\$M\)/i), { target: { value: '50' } });
  fireEvent.change(screen.getByLabelText(/Distributed \(\$M\)/i), { target: { value: '10' } });
  fireEvent.change(screen.getByLabelText(/NAV \(\$M\)/i), { target: { value: '40' } });
  fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'Active' } });

  fireEvent.click(screen.getByRole('button', { name: /^Add Fund$/i }));

  await waitFor(() => expect(screen.getByText(/New Fund/i)).toBeInTheDocument());
});

});
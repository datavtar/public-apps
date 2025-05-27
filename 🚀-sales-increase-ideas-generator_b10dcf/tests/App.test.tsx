import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Sales Booster/i)).toBeInTheDocument();
  });

  it('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeButton);
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
    fireEvent.click(darkModeButton);
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'false');
  });

  it('navigates to different tabs', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Analytics/i }));
    expect(screen.getByText(/Sales Analytics/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Customers/i }));
    expect(screen.getByText(/Customer Management/i)).toBeInTheDocument();
  });

  it('opens and closes the add customer modal', () => {
    render(<App />);

    // Open the modal
    fireEvent.click(screen.getByRole('button', { name: /Add Customer/i }));

    // Verify the modal is open by checking for an element inside it
    expect(screen.getByText(/Customer Name/i)).toBeInTheDocument();

    // Close the modal
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    // Verify the modal is closed by checking if an element is no longer in the document
    expect(screen.queryByText(/Customer Name/i)).not.toBeInTheDocument();
  });

  it('opens and closes the add strategy modal', () => {
    render(<App />);

    // Navigate to the strategies tab
    fireEvent.click(screen.getByRole('button', { name: /Strategies/i }));

    // Open the modal
    fireEvent.click(screen.getByRole('button', { name: /Add Strategy/i }));

    // Verify the modal is open by checking for an element inside it
    expect(screen.getByText(/Title/i)).toBeInTheDocument();

    // Close the modal
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    // Verify the modal is closed by checking if an element is no longer in the document
    expect(screen.queryByText(/Title/i)).not.toBeInTheDocument();
  });

  it('opens and closes the add goal modal', () => {
    render(<App />);

    // Navigate to the goals tab
    fireEvent.click(screen.getByRole('button', { name: /Goals/i }));

    // Open the modal
    fireEvent.click(screen.getByRole('button', { name: /Add Goal/i }));

    // Verify the modal is open by checking for an element inside it
    expect(screen.getByText(/Goal Title/i)).toBeInTheDocument();

    // Close the modal
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    // Verify the modal is closed by checking if an element is no longer in the document
    expect(screen.queryByText(/Goal Title/i)).not.toBeInTheDocument();
  });
});
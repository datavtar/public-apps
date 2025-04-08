import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

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

// Mock window.matchMedia
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
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Private Equity Portfolio Monitor/i)).toBeInTheDocument();
  });

  it('navigates to Funds view when Funds button is clicked', () => {
    render(<App />);
    const fundsButton = screen.getByRole('button', { name: /Funds/i });
    fundsButton.click();
    expect(screen.getByText(/Fund Name/i)).toBeInTheDocument();
  });

  it('navigates to Portfolio Companies view when Portfolio Companies button is clicked', () => {
    render(<App />);
    const companiesButton = screen.getByRole('button', { name: /Portfolio Companies/i });
    companiesButton.click();
    expect(screen.getByText(/Company Name/i)).toBeInTheDocument();
  });

  it('opens the add fund modal', () => {
    render(<App />);
    const addFundButton = screen.getByRole('button', { name: /Add Fund/i });
    addFundButton.click();
    expect(screen.getByText(/Add New Fund/i)).toBeInTheDocument();
  });

  it('opens the add company modal', () => {
    render(<App />);
    const addCompanyButton = screen.getByRole('button', { name: /Add Company/i });
    addCompanyButton.click();
    expect(screen.getByText(/Add New Portfolio Company/i)).toBeInTheDocument();
  });

  it('displays the dashboard with total AUM', () => {
    render(<App />);
    expect(screen.getByText(/Total AUM/i)).toBeInTheDocument();
  });

  it('displays the dashboard with average IRR', () => {
    render(<App />);
    expect(screen.getByText(/Average IRR/i)).toBeInTheDocument();
  });

  it('displays the dashboard with portfolio companies', () => {
    render(<App />);
    expect(screen.getByText(/Portfolio Companies/i)).toBeInTheDocument();
  });

  it('displays the dashboard with total unrealized value', () => {
    render(<App />);
    expect(screen.getByText(/Total Unrealized Value/i)).toBeInTheDocument();
  });

  it('should toggle dark mode', () => {
    render(<App />);
    const themeToggleButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    themeToggleButton.click();
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
  });

});
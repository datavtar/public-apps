import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders header with title', () => {
    render(<App />);
    expect(screen.getByText('Private Equity Fund Manager')).toBeInTheDocument();
  });

  test('renders navigation tabs', () => {
    render(<App />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Funds')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Companies')).toBeInTheDocument();
  });

  test('defaults to dashboard tab', () => {
    render(<App />);
    expect(screen.getByText('Total Commitment')).toBeInTheDocument();
  });

  test('navigates to funds tab', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Funds'));
    await waitFor(() => {
      expect(screen.getByText('Search funds...')).toBeInTheDocument();
    });
  });

  test('navigates to portfolio companies tab', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Portfolio Companies'));
    await waitFor(() => {
      expect(screen.getByText('Search companies...')).toBeInTheDocument();
    });
  });

  test('adds a fund', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Funds'));
    fireEvent.click(screen.getByRole('button', { name: /Add Fund/i }));

    await waitFor(() => {
      expect(screen.getByText('Add New Fund')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Fund Name'), { target: { value: 'Test Fund' } });
    fireEvent.change(screen.getByLabelText('Total Commitment ($)'), { target: { value: '1000000' } });
    fireEvent.change(screen.getByLabelText('Committed Amount ($)'), { target: { value: '500000' } });
    fireEvent.change(screen.getByLabelText('Vintage Year'), { target: { value: '2020' } });
    fireEvent.change(screen.getByLabelText('IRR (%)'), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText('MOIC (x)'), { target: { value: '2.5' } });
    fireEvent.change(screen.getByLabelText('DPI (x)'), { target: { value: '1.2' } });
    fireEvent.change(screen.getByLabelText('RVPI (x)'), { target: { value: '1.3' } });
    fireEvent.change(screen.getByLabelText('TVPI (x)'), { target: { value: '2.5' } });
    fireEvent.change(screen.getByLabelText('Sector'), { target: { value: 'Technology' } });
    fireEvent.change(screen.getByLabelText('Investment Stage'), { target: { value: 'Growth' } });
    fireEvent.change(screen.getByLabelText('Performance Rating'), { target: { value: 'Outperforming' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Add Fund/i }));

    await waitFor(() => {
      expect(screen.getByText('Test Fund')).toBeInTheDocument();
    });
  });

  test('adds a company', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Funds'));
    fireEvent.click(screen.getByRole('button', { name: /Add Fund/i }));

    await waitFor(() => {
      expect(screen.getByText('Add New Fund')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Fund Name'), { target: { value: 'Test Fund' } });
    fireEvent.change(screen.getByLabelText('Total Commitment ($)'), { target: { value: '1000000' } });
    fireEvent.change(screen.getByLabelText('Committed Amount ($)'), { target: { value: '500000' } });
    fireEvent.change(screen.getByLabelText('Vintage Year'), { target: { value: '2020' } });
    fireEvent.change(screen.getByLabelText('IRR (%)'), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText('MOIC (x)'), { target: { value: '2.5' } });
    fireEvent.change(screen.getByLabelText('DPI (x)'), { target: { value: '1.2' } });
    fireEvent.change(screen.getByLabelText('RVPI (x)'), { target: { value: '1.3' } });
    fireEvent.change(screen.getByLabelText('TVPI (x)'), { target: { value: '2.5' } });
    fireEvent.change(screen.getByLabelText('Sector'), { target: { value: 'Technology' } });
    fireEvent.change(screen.getByLabelText('Investment Stage'), { target: { value: 'Growth' } });
    fireEvent.change(screen.getByLabelText('Performance Rating'), { target: { value: 'Outperforming' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Add Fund/i }));
    fireEvent.click(screen.getByText('Portfolio Companies'));

    fireEvent.click(screen.getByRole('button', { name: /Add Company/i }));

    await waitFor(() => {
      expect(screen.getByText('Add New Portfolio Company')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Company Name'), { target: { value: 'Test Company' } });
    fireEvent.change(screen.getByLabelText('Fund'), { target: { value: '6' } });
    fireEvent.change(screen.getByLabelText('Sector'), { target: { value: 'Technology' } });
    fireEvent.change(screen.getByLabelText('Initial Investment ($)'), { target: { value: '200000' } });
    fireEvent.change(screen.getByLabelText('Current Valuation ($)'), { target: { value: '600000' } });
    fireEvent.change(screen.getByLabelText('Investment Date'), { target: { value: '2023-01-01' } });
    fireEvent.change(screen.getByLabelText('Revenue Growth (%)'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('EBITDA Margin (%)'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Active' } });
    fireEvent.change(screen.getByLabelText('Performance Rating'), { target: { value: 'Outperforming' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Add Company/i }));

    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeInTheDocument();
    });
  });

  test('shows alert if no funds when adding company', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation();
    render(<App />);
    fireEvent.click(screen.getByText('Portfolio Companies'));
    fireEvent.click(screen.getByRole('button', { name: /Add Company/i }));
    expect(alertMock).toHaveBeenCalledWith('Please add at least one fund before adding a portfolio company.');
    alertMock.mockRestore();
  });
});
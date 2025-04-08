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

// Mock window.confirm
const originalConfirm = window.confirm;

beforeEach(() => {
  window.confirm = jest.fn(() => true); // Always return true for confirmation
  localStorageMock.clear();
});

afterEach(() => {
  window.confirm = originalConfirm;
});


test('renders the app', () => {
  render(<App />);
  expect(screen.getByText(/Private Equity Portfolio Monitor/i)).toBeInTheDocument();
});

test('navigates to funds view', async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Funds/i));
  await waitFor(() => {
    expect(screen.getByText(/Add Fund/i)).toBeInTheDocument();
  });
});

test('navigates to portfolio companies view', async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Portfolio Companies/i));
  await waitFor(() => {
    expect(screen.getByText(/Add Company/i)).toBeInTheDocument();
  });
});

test('adds a new fund', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Funds/i));

    // Mock the initial state so that the add company button isn't disabled
    const initialFunds = [
      {
        id: '1',
        name: 'Test Fund',
        aum: 100,
        vintage: 2020,
        strategy: 'Test Strategy',
        irr: 10,
        moic: 1.5,
        tvpi: 1.2,
        dpi: 0.5,
        rvpi: 0.7,
        currentStatus: 'Active',
        performanceData: []
      }
    ];
    localStorage.setItem('funds', JSON.stringify(initialFunds));

    fireEvent.click(screen.getByRole('button', { name: /^Add Fund$/i }));

    fireEvent.change(screen.getByLabelText(/Fund Name/i), { target: { value: 'New Fund' } });
    fireEvent.change(screen.getByLabelText(/AUM \(in \$M\)/i), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/Vintage Year/i), { target: { value: '2022' } });
    fireEvent.change(screen.getByLabelText(/Investment Strategy/i), { target: { value: 'New Strategy' } });
    fireEvent.change(screen.getByLabelText(/IRR \(\%\)/i), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText(/MOIC/i), { target: { value: '1.8' } });
    fireEvent.change(screen.getByLabelText(/TVPI/i), { target: { value: '1.5' } });
    fireEvent.change(screen.getByLabelText(/DPI/i), { target: { value: '0.8' } });
    fireEvent.change(screen.getByLabelText(/RVPI/i), { target: { value: '0.7' } });
    fireEvent.change(screen.getByLabelText(/Fund Status/i), { target: { value: 'Active' } });

    fireEvent.click(screen.getByRole('button', { name: /^Add Fund$/i }));

    await waitFor(() => {
      expect(screen.getByText(/New Fund/i)).toBeInTheDocument();
    });
});

test('adds a new company', async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Portfolio Companies/i));

  // Mock the initial state so that the add company button isn't disabled
  const initialFunds = [
    {
      id: '1',
      name: 'Test Fund',
      aum: 100,
      vintage: 2020,
      strategy: 'Test Strategy',
      irr: 10,
      moic: 1.5,
      tvpi: 1.2,
      dpi: 0.5,
      rvpi: 0.7,
      currentStatus: 'Active',
      performanceData: []
    }
  ];
  localStorage.setItem('funds', JSON.stringify(initialFunds));
  localStorage.setItem('companies', JSON.stringify([]));

  fireEvent.click(screen.getByRole('button', { name: /^Add Company$/i }));

  fireEvent.change(screen.getByLabelText(/Company Name/i), { target: { value: 'New Company' } });
  fireEvent.change(screen.getByLabelText(/Fund/i), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText(/Sector/i), { target: { value: 'New Sector' } });
  fireEvent.change(screen.getByLabelText(/Region/i), { target: { value: 'New Region' } });
  fireEvent.change(screen.getByLabelText(/Investment Date/i), { target: { value: '2023-01-01' } });
  fireEvent.change(screen.getByLabelText(/Investment Amount \(\$M\)/i), { target: { value: '50' } });
  fireEvent.change(screen.getByLabelText(/Current Value \(\$M\)/i), { target: { value: '100' } });
  fireEvent.change(screen.getByLabelText(/Valuation Multiple/i), { target: { value: '2' } });
  fireEvent.change(screen.getByLabelText(/Exit Status/i), { target: { value: 'Holding' } });

  fireEvent.click(screen.getByRole('button', { name: /^Add Company$/i }));

  await waitFor(() => {
    expect(screen.getByText(/New Company/i)).toBeInTheDocument();
  });
});

test('deletes a fund', async () => {
  const initialFunds = [
    {
      id: '1',
      name: 'Test Fund',
      aum: 100,
      vintage: 2020,
      strategy: 'Test Strategy',
      irr: 10,
      moic: 1.5,
      tvpi: 1.2,
      dpi: 0.5,
      rvpi: 0.7,
      currentStatus: 'Active',
      performanceData: []
    }
  ];
  localStorage.setItem('funds', JSON.stringify(initialFunds));
  render(<App />);
  fireEvent.click(screen.getByText(/Funds/i));
  fireEvent.click(screen.getByRole('button', { name: /Delete Test Fund/i }));
  expect(window.confirm).toHaveBeenCalled();
  await waitFor(() => {
    expect(screen.queryByText(/Test Fund/i)).toBeNull();
  });
});

test('deletes a company', async () => {
  const initialCompanies = [
    {
      id: '1',
      fundId: '1',
      name: 'Test Company',
      sector: 'Test Sector',
      region: 'Test Region',
      investmentDate: '2023-01-01',
      investmentAmount: 50,
      valuationMultiple: 2,
      currentValue: 100,
      exitStatus: 'Holding',
      revenueData: [],
      ebitdaData: []
    }
  ];
  const initialFunds = [
    {
      id: '1',
      name: 'Test Fund',
      aum: 100,
      vintage: 2020,
      strategy: 'Test Strategy',
      irr: 10,
      moic: 1.5,
      tvpi: 1.2,
      dpi: 0.5,
      rvpi: 0.7,
      currentStatus: 'Active',
      performanceData: []
    }
  ];
  localStorage.setItem('funds', JSON.stringify(initialFunds));
  localStorage.setItem('companies', JSON.stringify(initialCompanies));

  render(<App />);
  fireEvent.click(screen.getByText(/Portfolio Companies/i));
  fireEvent.click(screen.getByRole('button', { name: /Delete Test Company/i }));
  expect(window.confirm).toHaveBeenCalled();
  await waitFor(() => {
    expect(screen.queryByText(/Test Company/i)).toBeNull();
  });
});

test('toggles dark mode', async () => {
  render(<App />);
  const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
  fireEvent.click(darkModeButton);
  expect(localStorage.getItem('darkMode')).toBe('true');

  const lightModeButton = screen.getByRole('button', { name: /Switch to light mode/i });
  fireEvent.click(lightModeButton);
  expect(localStorage.getItem('darkMode')).toBe('false');
});
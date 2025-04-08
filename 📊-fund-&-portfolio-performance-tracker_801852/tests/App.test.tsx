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

// Mock initial data
const mockFunds = [
  {
    id: 'fund1',
    name: 'Test Fund',
    aum: 1000000,
    vintage: 2020,
    irr: 10,
    moic: 1.5,
    dpi: 0.5,
    tvpi: 1.0,
    strategy: 'Test Strategy',
    status: 'Active',
    portfolioCompanies: [],
  },
];

const mockCompanies = [
  {
    id: 'company1',
    name: 'Test Company',
    sector: 'Test Sector',
    investmentDate: '2023-01-01',
    investmentAmount: 500000,
    currentValue: 750000,
    revenue: 1000000,
    ebitda: 200000,
    revenueGrowth: 5,
    ebitdaMargin: 10,
    fundId: 'fund1',
    status: 'Active',
  },
];

const mockMetrics = [
  {
    id: 'metric1',
    date: '2023-01-01',
    companyId: 'company1',
    revenue: 1000000,
    ebitda: 200000,
    cashflow: 100000,
    valuation: 2000000,
    employeeCount: 50,
  },
];

beforeEach(() => {
  localStorageMock.clear();
  localStorageMock.setItem('funds', JSON.stringify(mockFunds));
  localStorageMock.setItem('portfolioCompanies', JSON.stringify(mockCompanies));
  localStorageMock.setItem('performanceMetrics', JSON.stringify(mockMetrics));
});

test('renders PE Fund Manager title', () => {
  render(<App />);
  const titleElement = screen.getByText(/PE Fund Manager/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders dashboard view by default', () => {
  render(<App />);
  const totalAUMElement = screen.getByText(/Total AUM/i);
  expect(totalAUMElement).toBeInTheDocument();
});

test('navigates to funds view', async () => {
  render(<App />);
  const fundsButton = screen.getByRole('button', { name: /^Funds$/i });
  fireEvent.click(fundsButton);
  await waitFor(() => {
    expect(screen.getByText(/Fund Name/i)).toBeInTheDocument();
  });
});

test('navigates to companies view', async () => {
  render(<App />);
  const companiesButton = screen.getByRole('button', { name: /Portfolio Companies/i });
  fireEvent.click(companiesButton);
  await waitFor(() => {
    expect(screen.getByText(/Company Name/i)).toBeInTheDocument();
  });
});

test('adds a new fund', async () => {
  render(<App />);
  const fundsButton = screen.getByRole('button', { name: /^Funds$/i });
  fireEvent.click(fundsButton);

  const addFundButton = screen.getByRole('button', { name: /^Add Fund$/i });
  fireEvent.click(addFundButton);

  const fundNameInput = screen.getByLabelText(/Fund Name/i);
  fireEvent.change(fundNameInput, { target: { value: 'New Fund' } });

  const aumInput = screen.getByLabelText(/AUM/i);
  fireEvent.change(aumInput, { target: { value: '2000000' } });

  const vintageInput = screen.getByLabelText(/Vintage Year/i);
  fireEvent.change(vintageInput, { target: { value: '2024' } });

  const irrInput = screen.getByLabelText(/IRR/i);
  fireEvent.change(irrInput, { target: { value: '15' } });

  const moicInput = screen.getByLabelText(/MOIC/i);
  fireEvent.change(moicInput, { target: { value: '2' } });

  const dpiInput = screen.getByLabelText(/DPI/i);
  fireEvent.change(dpiInput, { target: { value: '0.7' } });

  const tvpiInput = screen.getByLabelText(/TVPI/i);
  fireEvent.change(tvpiInput, { target: { value: '1.8' } });

  const strategyInput = screen.getByLabelText(/Investment Strategy/i);
  fireEvent.change(strategyInput, { target: { value: 'New Strategy' } });

  const statusSelect = screen.getByLabelText(/Fund Status/i);
  fireEvent.change(statusSelect, { target: { value: 'Fundraising' } });

  const submitButton = screen.getByRole('button', { name: /Add Fund/i });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText(/New Fund/i)).toBeInTheDocument();
  });
});

test('adds a new company', async () => {
  render(<App />);
  const companiesButton = screen.getByRole('button', { name: /Portfolio Companies/i });
  fireEvent.click(companiesButton);

  const addCompanyButton = screen.getByRole('button', { name: /^Add Company$/i });
  fireEvent.click(addCompanyButton);

  const companyNameInput = screen.getByLabelText(/Company Name/i);
  fireEvent.change(companyNameInput, { target: { value: 'New Company' } });

  const sectorInput = screen.getByLabelText(/Sector/i);
  fireEvent.change(sectorInput, { target: { value: 'New Sector' } });

  const fundSelect = screen.getByLabelText(/Fund/i);
  fireEvent.change(fundSelect, { target: { value: 'fund1' } });

  const investmentDateInput = screen.getByLabelText(/Investment Date/i);
  fireEvent.change(investmentDateInput, { target: { value: '2024-01-01' } });

  const investmentAmountInput = screen.getByLabelText(/Investment Amount/i);
  fireEvent.change(investmentAmountInput, { target: { value: '600000' } });

  const currentValueInput = screen.getByLabelText(/Current Value/i);
  fireEvent.change(currentValueInput, { target: { value: '900000' } });

  const revenueInput = screen.getByLabelText(/Revenue/i);
  fireEvent.change(revenueInput, { target: { value: '1200000' } });

  const ebitdaInput = screen.getByLabelText(/EBITDA/i);
  fireEvent.change(ebitdaInput, { target: { value: '250000' } });

  const revenueGrowthInput = screen.getByLabelText(/Revenue Growth/i);
  fireEvent.change(revenueGrowthInput, { target: { value: '7' } });

  const ebitdaMarginInput = screen.getByLabelText(/EBITDA Margin/i);
  fireEvent.change(ebitdaMarginInput, { target: { value: '12' } });

  const statusSelect = screen.getByLabelText(/Status/i);
  fireEvent.change(statusSelect, { target: { value: 'Active' } });

  const submitButton = screen.getByRole('button', { name: /Add Company/i });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText(/New Company/i)).toBeInTheDocument();
  });
});

test('adds a new performance metric', async () => {
  render(<App />);
  const companiesButton = screen.getByRole('button', { name: /Portfolio Companies/i });
  fireEvent.click(companiesButton);

  // Assuming a company is selected to add metric
  const companyChartButton = screen.getAllByRole('button', {name: /ChartBar/i})[0];
  fireEvent.click(companyChartButton);

  const addMetricButton = screen.getByRole('button', { name: /Add Metric/i });
  fireEvent.click(addMetricButton);

  const metricDateInput = screen.getByLabelText(/Date/i);
  fireEvent.change(metricDateInput, { target: { value: '2024-02-01' } });

  const companyMetricRadio = screen.getByLabelText(/Company Metric/i)
  fireEvent.click(companyMetricRadio)

  const valuationInput = screen.getByLabelText(/Valuation/i);
  fireEvent.change(valuationInput, { target: { value: '3000000' } });

  const submitButton = screen.getByRole('button', { name: /Add Metric/i });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText(/2\/1\/2024/)).toBeInTheDocument();
  });
});

test('toggles dark mode', () => {
  render(<App />);
  const themeToggleButton = screen.getByRole('button', { name: /Switch to dark mode/i });
  fireEvent.click(themeToggleButton);

  expect(localStorageMock.getItem('darkMode')).toBe('true');

  fireEvent.click(themeToggleButton);
  expect(localStorageMock.getItem('darkMode')).toBe('false');
});
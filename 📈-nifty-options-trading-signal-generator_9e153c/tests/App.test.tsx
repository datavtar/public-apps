import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';



test('renders without crashing', () => {
  render(<App />);
});

test('shows loading state initially', () => {
  render(<App />);
  expect(screen.getByText('Loading NIFTY Analyzer')).toBeInTheDocument();
});

test('renders error state when there is an error', async () => {
  
  const originalFetch = global.fetch;
  global.fetch = jest.fn(() =>
    Promise.reject(new Error('Failed to fetch'))
  ) as jest.Mock;

  render(<App />);

  await waitFor(() => {
    expect(screen.queryByText('Loading NIFTY Analyzer')).not.toBeInTheDocument();
  }, { timeout: 5000 });

  expect(screen.getByText('Error Loading Data')).toBeInTheDocument();

  global.fetch = originalFetch;
});

test('renders live data banner', async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.queryByText('Loading NIFTY Analyzer')).not.toBeInTheDocument();
  }, { timeout: 5000 });

  const liveDataBanner = screen.getByText(/LIVE DATA:/i);
  expect(liveDataBanner).toBeInTheDocument();
});

test('renders trading signals section', async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.queryByText('Loading NIFTY Analyzer')).not.toBeInTheDocument();
  }, { timeout: 5000 });

  const tradingSignalsHeader = screen.getByText(/Trading Signals/i);
  expect(tradingSignalsHeader).toBeInTheDocument();
});

test('renders options chain section', async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.queryByText('Loading NIFTY Analyzer')).not.toBeInTheDocument();
  }, { timeout: 5000 });

  const optionsChainHeader = screen.getByText(/Options Chain/i);
  expect(optionsChainHeader).toBeInTheDocument();
});
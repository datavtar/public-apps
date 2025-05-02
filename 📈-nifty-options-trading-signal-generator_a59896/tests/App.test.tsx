import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';



describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
  });

  it('displays loading state initially', () => {
    render(<App />);
    expect(screen.getByText(/Loading NIFTY Analyzer/i)).toBeInTheDocument();
  });

  it('displays error state when there is an error', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.reject(new Error('Failed to fetch data'))
    );
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading NIFTY Analyzer/i)).not.toBeInTheDocument();
    }, { timeout: 6000 });
  });

  it('renders the main content after loading', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading NIFTY Analyzer/i)).not.toBeInTheDocument();
    }, { timeout: 6000 });

  });

  it('renders NIFTY Options Analyzer title', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading NIFTY Analyzer/i)).not.toBeInTheDocument();
    }, { timeout: 6000 });

    expect(screen.getByText(/NIFTY Options Analyzer/i)).toBeInTheDocument();
  });
});
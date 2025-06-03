import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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



describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading portfolio data...')).toBeInTheDocument();
  });

  it('renders the app after loading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Investment Portfolio')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('displays the investment portfolio overview', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Total Invested')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText('Current Value')).toBeInTheDocument();
    expect(screen.getByText('Total Return')).toBeInTheDocument();
    expect(screen.getByText('Companies')).toBeInTheDocument();
  });

  it('filters companies based on search term', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Investment Portfolio')).toBeInTheDocument();
    }, { timeout: 2000 });

    const searchInput = screen.getByPlaceholderText('Search companies...');
    fireEvent.change(searchInput, { target: { value: 'TechFlow' } });

    await waitFor(() => {
      expect(screen.getByText('TechFlow Solutions')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('opens company detail view when a company card is clicked', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Investment Portfolio')).toBeInTheDocument();
    }, { timeout: 2000 });

    const companyCard = screen.getByText('TechFlow Solutions');
    fireEvent.click(companyCard);

    await waitFor(() => {
      expect(screen.getByText('AI-powered workflow automation platform')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('navigates back to overview from company detail view', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Investment Portfolio')).toBeInTheDocument();
    }, { timeout: 2000 });

    const companyCard = screen.getByText('TechFlow Solutions');
    fireEvent.click(companyCard);

    await waitFor(() => {
      expect(screen.getByText('AI-powered workflow automation platform')).toBeInTheDocument();
    }, { timeout: 2000 });

    const backButton = screen.getByRole('button', { name: /^Back to overview$/i });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByText('Investment Portfolio')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('opens the add company modal when add button is clicked', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Investment Portfolio')).toBeInTheDocument();
      }, { timeout: 2000 });

      const addButton = screen.getByRole('button', { name: /^Add$/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Add New Company')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
});

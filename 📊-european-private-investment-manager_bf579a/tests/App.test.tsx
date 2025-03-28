import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
  });

  it('displays loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error message when loading fails', async () => {
    const localStorageMock = (() => {
      let store: { [key: string]: string } = {};

      return {
        getItem: (key: string): string | null => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = String(value);
        },
        clear: () => {
          store = {};
        },
        removeItem: (key: string) => {
          delete store[key];
        },
      };
    })();

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    localStorage.setItem('investments_data', 'invalid json');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load investment data. Please clear local storage or contact support.')).toBeInTheDocument();
    });
  });

  it('should open and close the modal', async () => {
    render(<App />);

    // Open the modal
    const addButton = screen.getByRole('button', { name: /^Add Investment$/i });
    fireEvent.click(addButton);

    // Check if the modal is open
    await waitFor(() => {
        expect(screen.getByText('Add New Investment')).toBeInTheDocument();
    });

    // Close the modal
    const closeButton = screen.getByRole('button', {name: /close/i});
    fireEvent.click(closeButton);

    // Check if the modal is closed
    await waitFor(() => {
      expect(screen.queryByText('Add New Investment')).not.toBeInTheDocument();
    });
  });

  it('should add a new investment', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /^Add Investment$/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Investment')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test Investment' } });
    fireEvent.change(screen.getByLabelText(/Asset Class/i), { target: { value: 'Private Equity' } });
    fireEvent.change(screen.getByLabelText(/Region/i), { target: { value: 'United Kingdom' } });
    fireEvent.change(screen.getByLabelText(/Investment Date/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/Invested Amount/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Current Value/i), { target: { value: '1200' } });
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'Active' } });

    const submitButton = screen.getByRole('button', { name: /^Submit$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Test Investment')).toBeInTheDocument();
    });
  });

  it('should render investment data when available', async () => {
     const mockInvestments = [
          {
            id: '1',
            name: 'Test Investment',
            assetClass: 'Private Equity',
            region: 'United Kingdom',
            investmentDate: '2024-01-01',
            investedAmount: 1000,
            currentValue: 1200,
            status: 'Active',
          },
        ];

        const localStorageMock = (() => {
            let store: { [key: string]: string } = {};

            return {
                getItem: (key: string): string | null => store[key] || null,
                setItem: (key: string, value: string) => {
                    store[key] = String(value);
                },
                clear: () => {
                    store = {};
                },
                removeItem: (key: string) => {
                    delete store[key];
                },
            };
        })();

        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
        });

        localStorage.setItem('investments_data', JSON.stringify(mockInvestments));

        render(<App />);

        await waitFor(() => {
            expect(screen.getByText('Test Investment')).toBeInTheDocument();
        });
    });
});
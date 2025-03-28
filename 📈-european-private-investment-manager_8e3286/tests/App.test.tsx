import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock the Intl.NumberFormat
jest.mock('intl', () => {
    const NumberFormat = jest.fn().mockImplementation(() => ({
        format: (value: number) => `Formatted ${value}`,
    }));
    return {
        NumberFormat,
    };
});


// Mock the format function from date-fns
jest.mock('date-fns', () => ({
    format: jest.fn().mockImplementation(() => '24 Nov 2024'),
}));



describe('App Component', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders without crashing', () => {
        render(<App />);
    });

    it('displays sample data when localStorage is empty', async () => {
        render(<App />);
        await waitFor(() => {
            expect(screen.getByText('European Growth Fund')).toBeInTheDocument();
            expect(screen.getByText('Swiss Bond Portfolio')).toBeInTheDocument();
            expect(screen.getByText('London Property Fund')).toBeInTheDocument();
        });
    });

    it('adds a new investment', async () => {
        render(<App />);

        fireEvent.click(screen.getByRole('button', { name: /^Add Investment$/i }));

        fireEvent.change(screen.getByLabelText(/Investment Name/i), { target: { value: 'New Investment' } });
        fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '1000' } });
        fireEvent.change(screen.getByLabelText(/Currency/i), { target: { value: 'USD' } });
        fireEvent.change(screen.getByLabelText(/Asset Class/i), { target: { value: 'Stocks' } });
        fireEvent.change(screen.getByLabelText(/Region/i), { target: { value: 'Western Europe' } });
        fireEvent.change(screen.getByLabelText(/Purchase Date/i), { target: { value: '2023-01-01' } });
        fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'Active' } });

        fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));
        await waitFor(() => {
            expect(screen.getByText('New Investment')).toBeInTheDocument();
        });
    });

    it('filters investments by name', async () => {
        render(<App />);
        await waitFor(() => {
            expect(screen.getByText('European Growth Fund')).toBeInTheDocument();
        });
        const searchInput = screen.getByPlaceholderText(/Search investments/i);
        fireEvent.change(searchInput, { target: { value: 'European' } });
        await waitFor(() => {
            expect(screen.getByText('European Growth Fund')).toBeInTheDocument();
            expect(screen.queryByText('Swiss Bond Portfolio')).not.toBeInTheDocument();
        });

        fireEvent.change(searchInput, { target: { value: '' } });
        await waitFor(() => {
            expect(screen.getByText('Swiss Bond Portfolio')).toBeInTheDocument();
        });
    });

    it('exports data to CSV', async () => {
        const mockCreateObjectURL = jest.fn();
        const mockAppendChild = jest.fn();
        const mockClick = jest.fn();

        Object.defineProperty(window, 'URL', {
            value: {
                createObjectURL: mockCreateObjectURL,
            },
        });

        Object.defineProperty(document, 'body', {
            value: {
                appendChild: mockAppendChild,
            },
        });

        const createElementMock = jest.fn().mockReturnValue({
            setAttribute: jest.fn(),
            click: mockClick,
        });

        jest.spyOn(document, 'createElement').mockImplementation(createElementMock);

        render(<App />);

        fireEvent.click(screen.getByRole('button', { name: /Export/i }));

        expect(mockCreateObjectURL).toHaveBeenCalled();

        await waitFor(() => {
            expect(screen.getByText('Data exported successfully')).toBeInTheDocument();
        });
    });

    it('imports data from CSV', async () => {
        render(<App />);
        const fileInput = screen.getByLabelText(/Import/i).closest('button');
        const file = new File(['name,amount,currency,asset class,region,purchase date,status,annual return,notes\nTest Investment,100,EUR,Stocks,Western Europe,2023-01-01,Active,5,Test notes'], 'test.csv', { type: 'text/csv' });

        const inputElement = screen.getByLabelText(/Import/i).closest('input');

        Object.defineProperty(inputElement, 'files', {
            value: [file],
            writable: true,
        });
        
        fireEvent.change(inputElement);

        await waitFor(() => {
            expect(screen.getByText(/Imported 1 investments successfully/i)).toBeInTheDocument();
            expect(screen.getByText('Test Investment')).toBeInTheDocument();
        });
    });

    it('toggles dark mode', async () => {
        render(<App />);

        const themeToggle = screen.getByRole('button', { name: /Switch to dark mode/i });
        fireEvent.click(themeToggle);

        expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');

        const themeToggleLight = screen.getByRole('button', { name: /Switch to light mode/i });
        fireEvent.click(themeToggleLight);
        expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'false');

    });
});
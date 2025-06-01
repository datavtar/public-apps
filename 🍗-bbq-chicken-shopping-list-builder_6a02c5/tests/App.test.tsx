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
    jest.clearAllMocks();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/BBQ Chicken Shopping List/i)).toBeInTheDocument();
  });

  test('initial portion size is 4', () => {
    render(<App />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  test('increases portion size when the add button is clicked', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Increase portion size/i });
    fireEvent.click(addButton);
    await waitFor(() => expect(screen.getByText('6')).toBeInTheDocument());
  });

  test('decreases portion size when the subtract button is clicked', async () => {
    render(<App />);
    const subtractButton = screen.getByRole('button', { name: /Decrease portion size/i });
    fireEvent.click(subtractButton);
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  });

  test('portion size cannot be less than 2', () => {
    render(<App />);
    const subtractButton = screen.getByRole('button', { name: /Decrease portion size/i });
    fireEvent.click(subtractButton);
    fireEvent.click(subtractButton);
    expect(screen.getByText('2')).toBeInTheDocument(); // Should remain at 2
  });

  test('portion size cannot be more than 20', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Increase portion size/i });
    for (let i = 0; i < 10; i++) {
      fireEvent.click(addButton);
    }
    expect(screen.getByText('20')).toBeInTheDocument(); // Should remain at 20
  });

  test('clicking a shopping list item toggles its checked state', async () => {
    render(<App />);
    const firstItem = await screen.findByText(/Whole Chicken/i);
    fireEvent.click(firstItem);
    await waitFor(() => expect(firstItem).toHaveClass('line-through'));

    fireEvent.click(firstItem);
    await waitFor(() => expect(firstItem).not.toHaveClass('line-through'));

  });

  test('resets the shopping list when reset button is clicked and confirmed', async () => {
    const confirmMock = jest.spyOn(window, 'confirm');
    confirmMock.mockImplementation(() => true);

    render(<App />);
    const firstItem = await screen.findByText(/Whole Chicken/i);

    fireEvent.click(firstItem);
    await waitFor(() => expect(firstItem).toHaveClass('line-through'));

    const resetButton = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetButton);

    await waitFor(() => expect(firstItem).not.toHaveClass('line-through'));
    confirmMock.mockRestore();
  });

  test('does not reset the shopping list when reset button is clicked and cancelled', async () => {
    const confirmMock = jest.spyOn(window, 'confirm');
    confirmMock.mockImplementation(() => false);

    render(<App />);
    const firstItem = await screen.findByText(/Whole Chicken/i);

    fireEvent.click(firstItem);
    await waitFor(() => expect(firstItem).toHaveClass('line-through'));

    const resetButton = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetButton);

    await waitFor(() => expect(firstItem).toHaveClass('line-through'));
    confirmMock.mockRestore();
  });

  test('switches to dark mode when the dark mode button is clicked', async () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeButton);
    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  test('switches to light mode when the light mode button is clicked', async () => {
    localStorage.setItem('darkMode', 'true');
    render(<App />);
    const lightModeButton = screen.getByRole('button', { name: /Switch to light mode/i });
    fireEvent.click(lightModeButton);
    await waitFor(() => expect(document.documentElement).not.toHaveClass('dark'));
    expect(localStorage.getItem('darkMode')).toBe('false');
  });

  test('exports the list to CSV', () => {
    const createElementSpy = jest.spyOn(document, 'createElement');
    const createObjectURLSpy = jest.spyOn(window.URL, 'createObjectURL');
    const revokeObjectURLSpy = jest.spyOn(window.URL, 'revokeObjectURL');

    render(<App />);
    const exportButton = screen.getByRole('button', { name: /Export CSV/i });
    fireEvent.click(exportButton);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(createObjectURLSpy).toHaveBeenCalled();
    // Additional assertions can be added to inspect the generated CSV content if needed
    expect(revokeObjectURLSpy).toHaveBeenCalled();

    createElementSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });
});
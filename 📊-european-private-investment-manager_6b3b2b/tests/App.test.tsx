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

// Mock matchMedia
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
  })),
});



test('renders the app', () => {
  render(<App />);
  expect(screen.getByText(/Investment Portfolio/i)).toBeInTheDocument();
});

test('navigates to investments view', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Investments/i }));
    await waitFor(() => {
        expect(screen.getByText(/All Investments/i)).toBeInTheDocument();
    });
});

test('navigates to reports view', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Reports/i }));
    await waitFor(() => {
        expect(screen.getByText(/Investment Reports/i)).toBeInTheDocument();
    });
});

test('navigates to settings view', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));
    await waitFor(() => {
        expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });
});

test('opens and closes the add investment modal', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Add Investment/i }));

  await waitFor(() => {
      expect(screen.getByText(/Add New Investment/i)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole('button', {name: "Cancel"}));

  await waitFor(() => {
    expect(screen.queryByText(/Add New Investment/i)).not.toBeInTheDocument();
  });
});

test('toggles dark mode', async () => {
  render(<App />);
  const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i});
  fireEvent.click(darkModeButton);

  expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
});

test('able to import excel data', async () => {
  render(<App />);
  const fileInput = screen.getByLabelText("Import Excel Data") as HTMLInputElement;
  const file = new File(["file contents"], "test.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

  fireEvent.change(fileInput, {
      target: {
          files: [file],
      },
  });

  const importButton = screen.getByRole("button", { name: /Import/i });
  fireEvent.click(importButton);

  await waitFor(() => {
      expect(screen.queryByText("Data imported successfully!")).toBeInTheDocument();
  }, {timeout: 5000})
});
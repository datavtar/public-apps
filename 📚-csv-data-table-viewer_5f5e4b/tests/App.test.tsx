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

// Mock the window.matchMedia
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
  }))
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('CSV Data Viewer')).toBeInTheDocument();
  });

  it('displays the upload section initially', () => {
    render(<App />);
    expect(screen.getByText('Upload a CSV File')).toBeInTheDocument();
  });

  it('shows error message when an invalid file type is uploaded', async () => {
    render(<App />);
    const file = new File([''], 'dummy.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('Browse Files') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
        expect(screen.getByText('Please upload a valid CSV file')).toBeInTheDocument();
    });
  });

  it('shows error message when CSV is empty', async () => {
    render(<App />);
    const file = new File([''], 'empty.csv', { type: 'text/csv' });
    const input = screen.getByLabelText('Browse Files') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
        expect(screen.getByText('No data found in the CSV file')).toBeInTheDocument();
    });
  });

  it('shows error message when CSV doesnt contain required headers', async () => {
    render(<App />);
    const file = new File(['header1,header2'], 'noheaders.csv', { type: 'text/csv' });
    const input = screen.getByLabelText('Browse Files') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
        expect(screen.getByText('CSV must contain status, origin, and destination columns')).toBeInTheDocument();
    });
  });
});
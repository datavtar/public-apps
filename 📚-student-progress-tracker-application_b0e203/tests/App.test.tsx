import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../src/App'

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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock the generateId function to return a predictable value
jest.mock('../src/App', () => {
  const originalModule = jest.requireActual('../src/App');
  return {
    __esModule: true,
    ...originalModule,
    default: function MockApp(...args: any[]) {
      // Use original App but mock generateId within it
      return React.createElement(originalModule.default, {
        ...args,
      });
    },
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Student Progress Tracker')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<App />);
    expect(screen.getByText('Loading Student Data...')).toBeInTheDocument();
  });

  it('renders student tab initially', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText(/Students/i)).toBeVisible())
  });

  it('renders the component', async () => {
    render(<App />);

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Loading Student Data.../i)).not.toBeInTheDocument();
    });

    // Now check for content that should be present after loading
    expect(screen.getByRole('button', { name: /Add Student/i })).toBeInTheDocument();
  });

  it('displays error message when localStorage fails to load', async () => {
    // Mock localStorage to throw an error when getItem is called
    const getItemMock = jest.spyOn(window.localStorage, 'getItem');
    getItemMock.mockImplementation(() => {
      throw new Error('Failed to read from localStorage');
    });

    render(<App />);

    await waitFor(() => {
        expect(screen.getByText(/Failed to load data/i)).toBeInTheDocument();
    })
  });
});
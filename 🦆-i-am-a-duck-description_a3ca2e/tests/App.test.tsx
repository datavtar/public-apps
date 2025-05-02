import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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


// Mock window.matchMedia
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


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Duck Tracker/i)).toBeInTheDocument();
  });

  test('displays initial ducks from local storage if available', () => {
    const mockDucks = [
      { id: '1', name: 'Test Duck', breed: 'Test Breed', age: 1, color: 'Test Color', location: 'Test Location', description: 'Test Description', lastSeen: '2023-01-01', isFavorite: false },
    ];
    localStorage.setItem('ducks', JSON.stringify(mockDucks));
    render(<App />);
    expect(screen.getByText(/Test Duck/i)).toBeInTheDocument();
  });

  test('displays initial ducks if local storage is empty', () => {
    render(<App />);
    expect(screen.getByText(/Quackers/i)).toBeInTheDocument();
    expect(screen.getByText(/Daffy/i)).toBeInTheDocument();
  });

  test('opens and closes the add duck modal', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add Duck/i });
    fireEvent.click(addButton);
    expect(screen.getByText(/Add New Duck/i)).toBeInTheDocument();
    const closeButton = screen.getByRole('button', {name: /Close modal/i});
    fireEvent.click(closeButton);
    // Wait for the modal to be removed from the DOM
    await screen.findByRole('button', { name: /Add Duck/i });
    expect(() => screen.getByText(/Add New Duck/i)).toThrow();
  });

  test('adds a new duck', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Add Duck/i }));

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Duck' } });
    fireEvent.change(screen.getByLabelText(/Breed/i), { target: { value: 'New Breed' } });
    fireEvent.change(screen.getByLabelText(/Age \(years\)/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Color/i), { target: { value: 'New Color' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'New Location' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByLabelText(/Last Seen Date/i), { target: { value: '2024-01-01' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Duck/i }));

    expect(await screen.findByText(/New Duck/i)).toBeInTheDocument();
  });

  test('opens and closes the filter panel', () => {
    render(<App />);
    const filterButton = screen.getByRole('button', { name: /Filters/i });
    fireEvent.click(filterButton);
    expect(screen.getByText(/Breed/i)).toBeInTheDocument();
    fireEvent.click(filterButton);
    expect(() => screen.getByText(/Breed/i)).toThrow();
  });

  test('filters ducks by name', async () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/Search ducks by name, breed, location.../i);
    fireEvent.change(searchInput, { target: { value: 'Quackers' } });

    expect(await screen.findByText(/Quackers/i)).toBeInTheDocument();
    expect(() => screen.queryByText(/Daffy/i)).toBeNull();
  });

  test('filters ducks by breed', async () => {
    render(<App />);
    const filterButton = screen.getByRole('button', { name: /Filters/i });
    fireEvent.click(filterButton);

    const breedSelect = screen.getByLabelText(/Breed/i);
    fireEvent.change(breedSelect, { target: { value: 'Mallard' } });

    expect(await screen.findByText(/Quackers/i)).toBeInTheDocument();
    expect(() => screen.queryByText(/Daffy/i)).toBeNull();
  });

  test('sorts ducks by name', async () => {
    render(<App />);
    const nameHeader = screen.getByText(/Name/i);
    fireEvent.click(nameHeader);
    const firstDuckName = screen.getAllByText(/./i)[19].textContent; // TODO - Figure out a better way to select first row name
    expect(firstDuckName).toBe('Bill');
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('true');
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
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


describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
  });

  it('renders without crashing', () => {
    render(<App />);
  });

  it('renders the header with the correct title', () => {
    render(<App />);
    const headerTitle = screen.getByText(/RealEstate Manager/i);
    expect(headerTitle).toBeInTheDocument();
  });

  it('initially displays the properties tab', () => {
    render(<App />);
    expect(screen.getByText(/Properties/i)).toBeInTheDocument();
  });

  it('switches to the appointments tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Appointments/i));
    expect(screen.getByText(/Property Appointments/i)).toBeInTheDocument();
  });

  it('switches to the analytics tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Analytics/i));
    expect(screen.getByText(/Total Properties/i)).toBeInTheDocument();
  });

  it('opens the add property modal when the "Add Property" button is clicked', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add Property/i });
    fireEvent.click(addButton);
    expect(screen.getByText(/Add New Property/i)).toBeInTheDocument();
  });

  it('closes the add property modal when the cancel button is clicked', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add Property/i });
    fireEvent.click(addButton);
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    expect(screen.queryByText(/Add New Property/i)).not.toBeInTheDocument();
  });

  it('displays a message when no properties are found matching filters', () => {
    render(<App />);
    const searchInput = screen.getByLabelText(/Search/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    // Wait for the filter to apply (you might need to adjust the timeout)
    setTimeout(() => {
      expect(screen.getByText(/No properties found matching your filters./i)).toBeInTheDocument();
    }, 500);
  });

  it('toggles theme mode when the theme toggle button is clicked', () => {
    render(<App />);
    const themeToggleButton = screen.getByRole('button', { name: /Switch to dark mode/i });

    // Initial theme mode is light
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Toggle to dark mode
    fireEvent.click(themeToggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Toggle back to light mode
    const themeToggleButtonLight = screen.getByRole('button', { name: /Switch to light mode/i });
    fireEvent.click(themeToggleButtonLight);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

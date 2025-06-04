import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the welcome message', () => {
    // Arrange
    render(<App />);

    // Act
    // (Nothing to do, rendering already happened)

    // Assert
    expect(screen.getByText(/Hello, World!/i)).toBeInTheDocument();
  });

  test('renders the copyright notice', () => {
    // Arrange
    render(<App />);

    // Act
    // (Nothing to do, rendering already happened)

    // Assert
    expect(screen.getByText(/Copyright © 2025 Datavtar Private Limited/i)).toBeInTheDocument();
  });

  test('toggles theme when the theme toggle button is clicked', () => {
    // Arrange
    render(<App />);
    const themeToggleButton = screen.getByRole('button', { name: /Switch to dark mode/i });

    // Act
    fireEvent.click(themeToggleButton);

    // Assert
    expect(themeToggleButton).toHaveAttribute('aria-label', 'Switch to light mode');
    fireEvent.click(themeToggleButton);
    expect(themeToggleButton).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  test('check initial theme based on localStorage and prefers-color-scheme', () => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            matches: query === '(prefers-color-scheme: dark)',
            media: query,
            onchange: null,
            addListener: jest.fn(), // deprecated
            removeListener: jest.fn(), // deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        }))
    });

    // Mock localStorage
    const localStorageMock = (() => {
        let store: { [key: string]: string } = {};

        return {
            getItem: (key: string): string | null => store[key] || null,
            setItem: (key: string, value: string): void => {
                store[key] = value.toString();
            },
            clear: (): void => {
                store = {};
            },
            removeItem: (key: string): void => {
                delete store[key];
            },
            length: 0,
            key: (index: number): string | null => (
                Object.keys(store)[index] || null
            ),
        };
    })();

    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
    });

    // Test case 1: localStorage is empty and prefers-color-scheme is dark
    window.matchMedia.mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    localStorage.clear();

    render(<App />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Test case 2: localStorage is empty and prefers-color-scheme is light
    window.matchMedia.mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)' ? false : false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
    }));
    localStorage.clear();

    render(<App />);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

     // Test case 3: localStorage has dark mode set to true
     localStorage.setItem('darkMode', 'true');
     render(<App />);
     expect(document.documentElement.classList.contains('dark')).toBe(true);

     // Test case 4: localStorage has dark mode set to false
     localStorage.setItem('darkMode', 'false');
     render(<App />);
     expect(document.documentElement.classList.contains('dark')).toBe(false);

  });
});
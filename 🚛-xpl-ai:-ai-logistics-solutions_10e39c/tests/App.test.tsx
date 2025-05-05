import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


// Mock localStorage
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

// Mock window.scrollTo
const scrollToMock = jest.fn();
window.scrollTo = scrollToMock;


describe('App Component', () => {
  beforeEach(() => {
    // Clear mocks and localStorage before each test
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('renders the app', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Toggle menu/i })).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });

    fireEvent.click(darkModeButton);
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'false');

    fireEvent.click(darkModeButton);
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
  });

  test('opens and closes the mobile menu', () => {
    render(<App />);
    const toggleMenuButton = screen.getByRole('button', { name: /Toggle menu/i });

    // Open the menu
    fireEvent.click(toggleMenuButton);
    expect(screen.getByRole('button', { name: /Home/i })).toBeInTheDocument(); // Check if a menu item is visible

    // Close the menu
    fireEvent.click(toggleMenuButton);
  });

  test('scrolls to section when a desktop navigation link is clicked', () => {
    render(<App />);
    const aboutLink = screen.getByRole('button', { name: /About/i });

    fireEvent.click(aboutLink);
    expect(scrollToMock).toHaveBeenCalled();
  });

  test('scrolls to section when a mobile navigation link is clicked', () => {
    render(<App />);
    const toggleMenuButton = screen.getByRole('button', { name: /Toggle menu/i });
    fireEvent.click(toggleMenuButton);

    const aboutLink = screen.getByRole('button', { name: /About/i });
    fireEvent.click(aboutLink);

    expect(scrollToMock).toHaveBeenCalled();
  });

  test('submits the contact form with valid data', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Your message/i), { target: { value: 'Hello, world!' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    // Expect localStorage to be updated
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  test('displays form errors with invalid data', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Message is required/i)).toBeInTheDocument();
  });
});
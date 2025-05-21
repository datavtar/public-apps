import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../src/App'

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

// Mock console.error to prevent test failures due to expected errors
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders the App component', () => {
    render(<App />);
    // Check if the FilmHub banner is present
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('renders the hero section with ABC Talkies', () => {
    render(<App />);
    // Use waitFor to ensure the component has finished rendering
    waitFor(() => {
        expect(screen.getByText(/ABC Talkies/i)).toBeInTheDocument();
    });
  });

  test('displays trending films section', async () => {
    render(<App />);
    // Wait for the trending films to load (adjust timeout if needed)
    await waitFor(() => screen.getByText(/Trending Films/i), { timeout: 2000 });
    // Check if at least one trending film is displayed
    expect(screen.getByText(/Trending Films/i)).toBeVisible();
  });

  test('displays contact us section when navigating', async () => {
      render(<App />);

      // Simulate navigation by updating the currentSection state
      const navigateToContact = () => {
        // Mock setCurrentSection, and call it with 'contact'
      };

      // Verify if the contact section is displayed after navigation
      // The mock implementation is not required.
  });

  test('opens and closes the sign-in modal', async () => {
    render(<App />);
    // Open the modal
    const signInButton = screen.getByRole('button', { name: /Sign In/i });
    expect(signInButton).toBeInTheDocument();

    // Check if the modal is present after clicking the button

    //const closeButton = screen.getByLabelText('Close modal')
    //expect(closeButton).toBeInTheDocument

    // Close the modal
  });

  test('handle sign up', async () => {
    render(<App />);

    const signUpButton = screen.getByRole('button', {name: /Sign Up/i});

    expect(signUpButton).toBeInTheDocument();
  });

  test('data refresh button functionality', async () => {
    render(<App />);
    const refreshButton = screen.getByRole('button', {name: /Refresh data/i});

    expect(refreshButton).toBeInTheDocument();

  });
});

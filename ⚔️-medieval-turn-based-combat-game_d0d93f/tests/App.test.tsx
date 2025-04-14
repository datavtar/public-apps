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


// Mock the playSound function
const mockPlaySound = jest.fn();

jest.mock('../src/App', () => {
  const ActualApp = jest.requireActual('../src/App').default;
  return {
    __esModule: true,
    default: () => {
      return <ActualApp playSound={mockPlaySound} />;
    },
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('renders header text', () => {
    render(<App />);
    expect(screen.getByText(/Medieval Combat Tournament/i)).toBeInTheDocument();
  });

  test('initializes game and displays character and tournament data', () => {
    render(<App />);

    // Wait for the game to initialize (characters to load)
    // Using findByText to wait for content to appear, avoiding hardcoded timeouts
    screen.findByText(/Sir Galahad/i).then(() => {
      expect(screen.getByText(/Sir Galahad/i)).toBeInTheDocument();
      expect(screen.getByText(/Village Cup/i)).toBeInTheDocument();
    });
  });

  test('starts a tournament when clicking the start tournament button', async () => {
    render(<App />);

    // Wait for the game to initialize and tournaments to load
    await screen.findByText(/Village Cup/i);

    const startTournamentButton = screen.getByRole('button', { name: /Start Tournament/i });
    fireEvent.click(startTournamentButton);

    // Assert that the battle screen is displayed after starting the tournament
    await screen.findByText(/Round 1 begins!/i);
  });


  test('opens and closes the tutorial modal', async () => {
    render(<App />);

    // Open the tutorial
    const tutorialButton = screen.getByRole('button', { name: /View tutorial/i });
    fireEvent.click(tutorialButton);

    // Check if the tutorial modal is open by checking for specific text in the tutorial
    expect(screen.getByText(/Welcome, brave warrior!/i)).toBeInTheDocument();

    // Close the tutorial
    const closeButton = screen.getByRole('button', { name: /Close tutorial/i });
    fireEvent.click(closeButton);

    // Ensure the tutorial modal is closed by checking if the tutorial text is no longer present
    // Using queryByText because it returns null if the element is not found, which is what we expect.
    // Use await and findByText for text which appears async
    expect(screen.queryByText(/Welcome, brave warrior!/i)).not.toBeInTheDocument();
  });

  test('goes to character screen and back', async () => {
    render(<App />);

    const characterButton = screen.getByRole('button', { name: /Character/i });
    fireEvent.click(characterButton);

    await screen.findByText(/Character Management/i);
    expect(screen.getByText(/Character Management/i)).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backButton);

    await screen.findByText(/Available Tournaments/i);
    expect(screen.getByText(/Available Tournaments/i)).toBeInTheDocument();
  });

  test('goes to equipment screen and back', async () => {
    render(<App />);

    const equipmentButton = screen.getByRole('button', { name: /Equipment/i });
    fireEvent.click(equipmentButton);

    await screen.findByText(/Equipment Management/i);
    expect(screen.getByText(/Equipment Management/i)).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backButton);

    await screen.findByText(/Available Tournaments/i);
    expect(screen.getByText(/Available Tournaments/i)).toBeInTheDocument();
  });
});
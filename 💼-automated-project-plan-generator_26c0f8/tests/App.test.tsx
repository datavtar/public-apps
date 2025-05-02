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
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});


test('renders the app', () => {
  render(<App />);
  expect(screen.getByText(/Project Plans/i)).toBeInTheDocument();
});

test('creates a new project plan', async () => {
  render(<App />);
  const newPlanButton = screen.getByRole('button', { name: /New Plan/i });
  fireEvent.click(newPlanButton);

  await waitFor(() => {
    expect(screen.getByText(/Project Information/i)).toBeInTheDocument();
  });

  const backButton = screen.getByRole('button', {name: /Back to Plans/i});
  fireEvent.click(backButton);
});

test('displays no project plans found message when there are no project plans', () => {
    localStorageMock.setItem('projectPlans', JSON.stringify([]));
    render(<App />);
    expect(screen.getByText(/No project plans found./i)).toBeInTheDocument();
});

test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeButton);
    expect(localStorageMock.getItem('darkMode')).toBe('true');

    const lightModeButton = screen.getByRole('button', { name: /Switch to light mode/i });
    if (lightModeButton) {
        fireEvent.click(lightModeButton);
    }
    expect(localStorageMock.getItem('darkMode')).toBe('false');
});

test('generates a project plan from requirements', async () => {
  render(<App />);
  const generatePlanTab = screen.getByRole('button', { name: /Generate Plan/i });
  fireEvent.click(generatePlanTab);

  const textareaElement = screen.getByPlaceholderText(/Paste client requirements here.../i);
  fireEvent.change(textareaElement, { target: { value: 'Sample requirements' } });

  const generateButton = screen.getByRole('button', { name: /Generate Plan/i });
  fireEvent.click(generateButton);

  // Wait for loading state
  await waitFor(() => {
    expect(screen.getByText(/Generating.../i)).toBeInTheDocument();
  });

  // Wait for plan to be generated
  await waitFor(() => {
    expect(screen.getByText(/Project Information/i)).toBeInTheDocument();
  }, {timeout: 10000});

  const backButton = screen.getByRole('button', {name: /Back to Plans/i});
  fireEvent.click(backButton);
});

test('imports a project plan', async () => {
    render(<App />);
    const importButton = screen.getByText('Import');

    const file = new File(['{"id":"test-plan", "title":"Test Plan"}'], 'test.json', { type: 'application/json' });
    const input = screen.getByLabelText('Import') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
        value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
        expect(screen.getByText(/Project Information/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', {name: /Back to Plans/i});
    fireEvent.click(backButton);
});

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
    clear(): void {
      store = {};
    },
    removeItem(key: string): void {
      delete store[key];
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

  test('renders Educator\'s Workbench title', () => {
    render(<App />);
    expect(screen.getByText(/Educator's Workbench/i)).toBeInTheDocument();
  });

  test('navigates to lesson plans tab', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Lesson Plans/i));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search lesson plans.../i)).toBeInTheDocument();
    });
  });

  test('navigates to resources tab', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Resources/i));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search resources.../i)).toBeInTheDocument();
    });
  });

  test('navigates to dashboard tab', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Dashboard/i));
    await waitFor(() => {
      expect(screen.getByText(/Total Lesson Plans/i)).toBeInTheDocument();
    });
  });

  test('creates a new lesson plan', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Lesson Plans/i));
    fireEvent.click(screen.getByRole('button', { name: /^New Lesson Plan$/i }));

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Test Lesson' } });
    fireEvent.change(screen.getByLabelText(/Subject/i), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText(/Grade Level/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Duration \(minutes\)/i), { target: { value: '60' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Lesson Plan/i }));

    await waitFor(() => {
        expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    });
  });

  test('creates a new resource', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Resources/i));
    fireEvent.click(screen.getByRole('button', { name: /^New Resource$/i }));

    fireEvent.change(screen.getByLabelText(/Resource Name/i), { target: { value: 'Test Resource' } });
    fireEvent.change(screen.getByLabelText(/URL \/ Link/i), { target: { value: 'http://example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Resource/i }));

    await waitFor(() => {
        expect(screen.getByText('Test Resource')).toBeInTheDocument();
    });
  });
});

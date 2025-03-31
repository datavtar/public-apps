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

// Mock the window.matchMedia method
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

  test('renders the app with initial data from localStorage', () => {
    const mockData = JSON.stringify({
      projects: [],
      molecules: [],
      experiments: [],
      notes: [],
    });
    localStorage.setItem('scientistLabData', mockData);

    render(<App />);

    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
  });

  test('renders the dashboard tab as active by default', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveClass('bg-slate-700');
  });

  test('navigation to projects tab works', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Projects' }));
    expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument();
  });

  test('navigation to molecules tab works', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Molecules' }));
    expect(screen.getByRole('heading', { name: 'Molecules' })).toBeInTheDocument();
  });

  test('navigation to experiments tab works', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Experiments' }));
    expect(screen.getByRole('heading', { name: 'Experiments' })).toBeInTheDocument();
  });

  test('navigation to notes tab works', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Notes' }));
    expect(screen.getByRole('heading', { name: 'Notes' })).toBeInTheDocument();
  });

  test('navigation to analytics tab works', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Analytics' }));
    expect(screen.getByRole('heading', { name: 'Analytics' })).toBeInTheDocument();
  });

  test('allows adding a new project', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Projects' }));

    // Open the add project modal
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }));

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Project Title'), { target: { value: 'Test Project' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Active' } });
    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Target Completion Date'), { target: { value: '2024-02-01' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Save Project' }));

    // Assert that the new project is displayed
    expect(await screen.findByText('Test Project')).toBeInTheDocument();
  });


});
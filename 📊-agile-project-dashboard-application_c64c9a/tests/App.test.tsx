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

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});



describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('renders the Agile Dashboard title', () => {
    render(<App />);
    expect(screen.getByText('Agile Dashboard')).toBeInTheDocument();
  });

  test('create new project', async () => {
    render(<App />);

    const newProjectButton = screen.getByRole('button', { name: /New Project/i });
    fireEvent.click(newProjectButton);

    const projectNameInput = screen.getByLabelText(/Project Name/i);
    fireEvent.change(projectNameInput, { target: { value: 'Test Project' } });

    const createProjectButton = screen.getByRole('button', { name: /Create Project/i });
    fireEvent.click(createProjectButton);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  test('dark mode toggle', () => {
    render(<App />);
    const themeToggleButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(themeToggleButton);
    expect(localStorageMock.getItem('darkMode')).toBe('true');
  });

  test('import modal opens and closes', () => {
    render(<App />);
    const importButton = screen.getByRole('button', { name: /Import/i });
    fireEvent.click(importButton);
    expect(screen.getByText(/Import Data/i)).toBeInTheDocument();

    const closeModalButton = screen.getByRole('button', {name: /Close modal/i});
    fireEvent.click(closeModalButton);
  });

  test('renders create project modal', () => {
    render(<App />);
    const newProjectButton = screen.getByRole('button', { name: /New Project/i });
    fireEvent.click(newProjectButton);
    expect(screen.getByText(/Create New Project/i)).toBeInTheDocument();
  });

  test('renders create sprint modal', async () => {
    render(<App />);

    const newProjectButton = screen.getByRole('button', { name: /New Project/i });
    fireEvent.click(newProjectButton);

    const projectNameInput = screen.getByLabelText(/Project Name/i);
    fireEvent.change(projectNameInput, { target: { value: 'Test Project' } });

    const createProjectButton = screen.getByRole('button', { name: /Create Project/i });
    fireEvent.click(createProjectButton);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    const sprintTabButton = screen.getByText('Sprints');
    fireEvent.click(sprintTabButton);

    const newSprintButton = screen.getByRole('button', { name: /New Sprint/i });
    fireEvent.click(newSprintButton);

    expect(screen.getByText(/Create New Sprint/i)).toBeInTheDocument();

  });
});
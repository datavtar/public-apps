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

// Mock matchMedia
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
  }))
});

describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.getByText('Senior Product Manager')).toBeInTheDocument();
  });

  test('navigates to experience section when experience link is clicked', () => {
    render(<App />);

    const experienceLink = screen.getByText('Experience');
    fireEvent.click(experienceLink);

    expect(screen.getByText('Work Experience')).toBeInTheDocument();
  });

  test('navigates to education section when education link is clicked', () => {
    render(<App />);

    const educationLink = screen.getByText('Education');
    fireEvent.click(educationLink);

    expect(screen.getByText('Education')).toBeInTheDocument();
  });

  test('navigates to skills section when skills link is clicked', () => {
    render(<App />);

    const skillsLink = screen.getByText('Skills');
    fireEvent.click(skillsLink);

    expect(screen.getByText('Skills')).toBeInTheDocument();
  });

  test('navigates to projects section when projects link is clicked', () => {
    render(<App />);

    const projectsLink = screen.getByText('Projects');
    fireEvent.click(projectsLink);

    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  test('opens and closes the upload resume modal', () => {
    render(<App />);
    const uploadButton = screen.getByRole('button', { name: /upload resume/i });

    fireEvent.click(uploadButton);
    expect(screen.getByText(/Upload your resume in PDF or DOC format/i)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', {name: /close/i});
    fireEvent.click(closeButton);

    expect(screen.queryByText(/Upload your resume in PDF or DOC format/i)).not.toBeInTheDocument();
  });

  test('toggle dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', {name: /switch to dark mode/i});

    fireEvent.click(darkModeButton);

    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
  });
});
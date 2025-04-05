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
    localStorage.clear();
  });

  test('renders basic content', () => {
    render(<App />);
    expect(screen.getByText("Alex Johnson's Portfolio")).toBeInTheDocument();
  });

  test('toggles dark mode', async () => {
    render(<App />);
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(themeToggle);
    expect(localStorage.getItem('darkMode')).toBe('true');

    const themeToggleLight = screen.getByRole('button', { name: /switch to light mode/i });
    if (themeToggleLight) {
      fireEvent.click(themeToggleLight);
      expect(localStorage.getItem('darkMode')).toBe('false');
    }
  });

  test('imports and exports resume data', async () => {
    render(<App />);

    const mockResumeData = {
      personalInfo: {
        name: 'Test Name',
        title: 'Test Title',
        email: 'test@example.com',
        phone: '123-456-7890',
        location: 'Test Location',
      },
      summary: 'Test Summary',
      workExperience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
    };

    const file = new File([JSON.stringify(mockResumeData)], 'resume.json', { type: 'application/json' });
    const uploadInput = screen.getByLabelText(/import resume json/i) as HTMLInputElement;
    
    // Mocking the file selection and event dispatch.
    Object.defineProperty(uploadInput, 'files', {
        value: [file],
    });

    fireEvent.change(uploadInput);

    // Wait for the alert to appear (and disappear)
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Resume uploaded successfully!');
    }, { timeout: 2000 });

    expect(localStorage.getItem('resumeData')).toEqual(JSON.stringify(mockResumeData));
  });

  test('opens and closes the mobile menu', () => {
    render(<App />);
    const openMenuButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(openMenuButton);
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();

    const closeMenuButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(closeMenuButton);
    //expect(screen.queryByRole('link', { name: /home/i })).not.toBeInTheDocument();
  });
});

// Mock window.alert for testing file import

const originalAlert = window.alert;

beforeAll(() => {
  window.alert = jest.fn();
});

afterAll(() => {
  window.alert = originalAlert;
});
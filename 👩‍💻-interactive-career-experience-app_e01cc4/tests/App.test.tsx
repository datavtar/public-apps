import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock the resume data and theme in localStorage
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('theme', 'light');
  localStorage.setItem('resumeData', JSON.stringify({
    personalInfo: {
      name: 'Test User',
      title: 'Test Title',
      summary: 'Test Summary',
      email: 'test@example.com',
      phone: '123-456-7890',
      location: 'Test Location',
      website: 'test.com',
      linkedin: 'linkedin.com/test',
      github: 'github.com/test',
      avatar: ''
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    portfolio: []
  }));
});

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Test User/i);
  expect(linkElement).toBeInTheDocument();
});

test('displays the default resume data', () => {
  render(<App />);

  // Check if personal info is displayed
  expect(screen.getByText('Test User')).toBeInTheDocument();
  expect(screen.getByText('Test Title | Test Title')).toBeInTheDocument();
  expect(screen.getByText('Test Summary')).toBeInTheDocument();
  expect(screen.getByText('test@example.com')).toBeInTheDocument();
  expect(screen.getByText('123-456-7890')).toBeInTheDocument();
  expect(screen.getByText('Test Location')).toBeInTheDocument();
  expect(screen.getByText('test.com')).toBeInTheDocument();
});

test('displays the Interactive Resume Experience section', () => {
  render(<App />);
  expect(screen.getByText(/Upload your resume to personalize this experience or explore my professional journey./i)).toBeInTheDocument();
});

test('displays the correct theme on initial render', () => {
  render(<App />);
  expect(localStorage.getItem('theme')).toBe('light');
});

test('displays upload error message when no file is selected', async () => {
  render(<App />);
  const uploadButton = screen.getByRole('button', { name: /Upload/i });
  fireEvent.click(uploadButton);

  await waitFor(() => {
    expect(screen.getByText('Please select a file first')).toBeInTheDocument();
  });
});

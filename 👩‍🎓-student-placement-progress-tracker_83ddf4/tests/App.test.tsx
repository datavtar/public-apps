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


beforeEach(() => {
  localStorageMock.clear();
});


test('renders the App component', () => {
  render(<App />);
  expect(screen.getByText(/Placement Tracker/i)).toBeInTheDocument();
});

test('displays dashboard tab by default', () => {
    render(<App />);
    expect(screen.getByText(/Placement Rate/i)).toBeInTheDocument();
});

test('navigates to students tab', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Students/i));
    expect(screen.getByText(/Add Student/i)).toBeInTheDocument();
});

test('navigates to companies tab', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Companies/i));
    expect(screen.getByText(/Add Company/i)).toBeInTheDocument();
});

test('navigates to interviews tab', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Interviews/i));
    expect(screen.getByText(/Upcoming Interviews/i)).toBeInTheDocument();
});

test('opens and closes the add student modal', async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Students/i));
  const addButton = screen.getByRole('button', { name: /^Add Student$/i });
  fireEvent.click(addButton);
  expect(screen.getByText(/Full Name/i)).toBeInTheDocument();
  const cancelButton = screen.getByRole('button', { name: /^Cancel$/i });
  fireEvent.click(cancelButton);
});

test('opens and closes the add company modal', async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Companies/i));
  const addButton = screen.getByRole('button', { name: /^Add Company$/i });
  fireEvent.click(addButton);
  expect(screen.getByText(/Company Name/i)).toBeInTheDocument();
  const cancelButton = screen.getByRole('button', { name: /^Cancel$/i });
  fireEvent.click(cancelButton);
});


test('imports student data from a JSON file', async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Students/i));
  const importButton = screen.getByText(/Import/i);

  // Mock the file input
  const fileContent = JSON.stringify([{ name: 'Test Student', rollNumber: '123', email: 'test@example.com', degree: 'B.Tech', branch: 'CSE', graduationYear: 2024, cgpa: 7.5, placementStatus: 'Not Placed', skills: [] }]);
  const file = new File([fileContent], 'students.json', { type: 'application/json' });

  // Mock the input element
  const inputElement = screen.getByRole('button', { name: /Import/i }).parentElement?.querySelector('input') as HTMLInputElement;
  
  // Check if inputElement exists before proceeding
  if (!inputElement) {
    throw new Error("Input element for file import not found.");
  }

  Object.defineProperty(inputElement, 'files', {
    value: [file],
    writable: true,
  });

  fireEvent.change(inputElement);
});

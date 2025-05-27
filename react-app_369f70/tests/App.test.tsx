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


beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});


test('renders the app', () => {
  render(<App />);
  expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
});

test('renders Students tab by default', () => {
  render(<App />);
  expect(screen.getByText(/Students/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Add Student/i })).toBeInTheDocument();
});

test('switches to Grades tab when clicked', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Grades/i));
  expect(screen.getByText(/Grades/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Add Grade/i })).toBeInTheDocument();
});

test('switches to Attendance tab when clicked', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Attendance/i));
  expect(screen.getByText(/Attendance/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Mark Attendance/i })).toBeInTheDocument();
});

test('switches to Assignments tab when clicked', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Assignments/i));
  expect(screen.getByText(/Assignments/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Add Assignment/i })).toBeInTheDocument();
});

test('switches to Communication tab when clicked', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Communication/i));
  expect(screen.getByText(/Communication/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Add Communication/i })).toBeInTheDocument();
});

test('switches to Reports tab when clicked', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Reports/i));
  expect(screen.getByText(/Reports & Analytics/i)).toBeInTheDocument();
});

test('opens add student modal when add student button is clicked', async () => {
  render(<App />);
  const addButton = screen.getByRole('button', { name: /Add Student/i });

  fireEvent.click(addButton);
  expect(screen.getByText(/Add Student/i)).toBeVisible();

  const firstNameLabel = await screen.findByText(/First Name/i);
  expect(firstNameLabel).toBeVisible();
});

test('opens add grade modal when add grade button is clicked', async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Grades/i));
  const addButton = screen.getByRole('button', { name: /Add Grade/i });

  fireEvent.click(addButton);
  expect(screen.getByText(/Add Grade/i)).toBeVisible();

  const studentLabel = await screen.findByText(/Student/i);
  expect(studentLabel).toBeVisible();
});


test('export and import buttons are present', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Import/i })).toBeInTheDocument();
});

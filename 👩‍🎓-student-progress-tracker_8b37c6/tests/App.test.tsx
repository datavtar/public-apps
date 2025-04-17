import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string) {
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




test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Student Progress Tracker/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders the Students tab by default', () => {
  render(<App />);
  expect(screen.getByText(/Students/i)).toBeInTheDocument();
});


test('renders the Add Student button in Students tab', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /Add Student/i })).toBeInTheDocument();
});

test('renders the Grades tab', () => {
  render(<App />);
  expect(screen.getByText(/Grades/i)).toBeInTheDocument();
});

test('renders the Attendance tab', () => {
  render(<App />);
  expect(screen.getByText(/Attendance/i)).toBeInTheDocument();
});

test('renders the Homework tab', () => {
  render(<App />);
  expect(screen.getByText(/Homework/i)).toBeInTheDocument();
});

test('renders the Reports tab', () => {
  render(<App />);
  expect(screen.getByText(/Reports/i)).toBeInTheDocument();
});

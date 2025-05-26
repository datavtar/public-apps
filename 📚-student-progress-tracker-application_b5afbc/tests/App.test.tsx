import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

// Mock window.confirm
const originalConfirm = window.confirm;

beforeEach(() => {
  window.confirm = jest.fn(() => true); // Always confirm
  localStorage.clear();
});

afterEach(() => {
  window.confirm = originalConfirm;
});


describe('App Component', () => {
  test('renders the app', () => {
    render(<App />);
    expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
  });

  test('navigates to Students tab', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Students/i));
    expect(screen.getByText(/Students/i)).toBeInTheDocument();
  });

  test('navigates to Grades tab', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Grades/i));
    expect(screen.getByText(/Grades/i)).toBeInTheDocument();
  });

  test('navigates to Attendance tab', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Attendance/i));
    expect(screen.getByText(/Attendance/i)).toBeInTheDocument();
  });

  test('navigates to Assignments tab', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Assignments/i));
    expect(screen.getByText(/Assignments/i)).toBeInTheDocument();
  });

  test('opens add student modal', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Students/i));
    fireEvent.click(screen.getByRole('button', { name: /^Add Student$/i }));
    expect(screen.getByText(/Add Student/i)).toBeInTheDocument();
  });

  test('opens add grade modal', () => {
        render(<App />);
        fireEvent.click(screen.getByText(/Grades/i));

        // Check if there are any students to avoid the "You need to add students" alert
        const hasStudents = localStorage.getItem('students');
        if (!hasStudents) {
            localStorage.setItem('students', JSON.stringify([{id: '1', name: 'Test Student', email: 'test@example.com', phone: '123-456-7890', grade: '10', createdAt: new Date().toISOString()}]))
        }

        fireEvent.click(screen.getByRole('button', { name: /^Add Grade$/i }));
        expect(screen.getByText(/Add Grade/i)).toBeInTheDocument();
    });

  test('opens add attendance modal', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Attendance/i));

    // Check if there are any students to avoid the "You need to add students" alert
    const hasStudents = localStorage.getItem('students');
    if (!hasStudents) {
        localStorage.setItem('students', JSON.stringify([{id: '1', name: 'Test Student', email: 'test@example.com', phone: '123-456-7890', grade: '10', createdAt: new Date().toISOString()}]))
    }

    fireEvent.click(screen.getByRole('button', { name: /^Add Attendance$/i }));
    expect(screen.getByText(/Add Attendance/i)).toBeInTheDocument();
  });

  test('opens add assignment modal', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Assignments/i));
    fireEvent.click(screen.getByRole('button', { name: /^Add Assignment$/i }));
    expect(screen.getByText(/Add Assignment/i)).toBeInTheDocument();
  });
});
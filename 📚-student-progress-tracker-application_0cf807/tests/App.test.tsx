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

// Mock window.confirm
const originalConfirm = window.confirm;

beforeEach(() => {
  window.confirm = jest.fn(() => true); // Always return true for confirmation
  localStorageMock.clear();
});

afterEach(() => {
    window.confirm = originalConfirm;
});


test('renders the app without crashing', () => {
  render(<App />);
  expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
});

test('adds a new student', () => {
  render(<App />);

  // Open the add student modal
  const addButton = screen.getByRole('button', { name: /Add Student/i });
  fireEvent.click(addButton);

  // Fill out the form
  const nameInput = screen.getByLabelText(/Name/i);
  fireEvent.change(nameInput, { target: { value: 'Test Student' } });

  const emailInput = screen.getByLabelText(/Email/i);
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

  const submitButton = screen.getByRole('button', { name: /Add Student/i });
  fireEvent.click(submitButton);

  // Assert that the student is added (check if the name appears)
  expect(screen.getByText(/Test Student/i)).toBeInTheDocument();
});

test('deletes a student', () => {
    render(<App />);

    // Add a student first (repeat add student test steps)
    const addButton = screen.getByRole('button', { name: /Add Student/i });
    fireEvent.click(addButton);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Student to Delete' } });

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'delete@example.com' } });

    const submitButton = screen.getByRole('button', { name: /Add Student/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Student to Delete/i)).toBeInTheDocument();

    // Now delete the student
    const deleteButton = screen.getByRole('button', { name: /Delete student/i });
    fireEvent.click(deleteButton);

    // Assert that student is deleted
    expect(screen.queryByText(/Student to Delete/i)).not.toBeInTheDocument();
});

test('opens and closes the add student modal', () => {
    render(<App />);

    const addButton = screen.getByRole('button', { name: /Add Student/i });
    fireEvent.click(addButton);

    expect(screen.getByText(/Student Information/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText(/Student Information/i)).not.toBeInTheDocument();
});

test('generates and downloads a report for a student', async () => {
    render(<App />);

    // Add a student (repeat add student test steps)
    const addButton = screen.getByRole('button', { name: /Add Student/i });
    fireEvent.click(addButton);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Report Student' } });

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'report@example.com' } });

    const submitButton = screen.getByRole('button', { name: /Add Student/i });
    fireEvent.click(submitButton);

    // Open the student details page
    const viewDetailsButton = screen.getByRole('button', {name: /View student details/i});
    fireEvent.click(viewDetailsButton);

    // Generate the report
    const generateReportButton = screen.getByRole('button', { name: /Generate Report/i });
    fireEvent.click(generateReportButton);

    // Check if the report preview modal opens
    expect(screen.getByText(/Student Progress Report/i)).toBeInTheDocument();

});

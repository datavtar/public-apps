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
  localStorage.clear();
});

test('renders the app', () => {
  render(<App />);
  expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
});

test('navigates to students tab by default', () => {
  render(<App />);
  expect(screen.getByText(/Students/i)).toBeInTheDocument();
});

test('adds a student', () => {
  render(<App />);

  // Arrange
  const addButton = screen.getByRole('button', { name: /Add Student/i });

  // Act
  fireEvent.click(addButton);
  const nameInput = screen.getByLabelText(/Name\*/i);
  const emailInput = screen.getByLabelText(/Email\*/i);
  const addStudentButton = screen.getByRole('button', { name: /Add Student$/i });

  fireEvent.change(nameInput, { target: { value: 'Test Student' } });
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.click(addStudentButton);

  // Assert
  expect(screen.getByText(/Test Student/i)).toBeInTheDocument();
});

test('deletes a student', () => {
  render(<App />);

  // Arrange
  const addButton = screen.getByRole('button', { name: /Add Student/i });
  fireEvent.click(addButton);
  const nameInput = screen.getByLabelText(/Name\*/i);
  const emailInput = screen.getByLabelText(/Email\*/i);
  const addStudentButton = screen.getByRole('button', { name: /Add Student$/i });
  fireEvent.change(nameInput, { target: { value: 'Test Student' } });
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.click(addStudentButton);

  // Act
  window.confirm = jest.fn(() => true); // Mock the confirm function
  const deleteButton = screen.getByRole('button', {name: /trash2/i});
  fireEvent.click(deleteButton);

  // Assert
  expect(screen.queryByText(/Test Student/i)).not.toBeInTheDocument();
});

test('imports students from JSON', async () => {
  render(<App />);
  const importButton = screen.getByRole('button', { name: /Import/i });
  fireEvent.click(importButton);
  const dataTypeSelect = screen.getByLabelText(/Data Type/i);
  fireEvent.change(dataTypeSelect, { target: { value: 'students' } });
  const dataPreviewTextarea = screen.getByRole('textbox');

  const mockStudents = JSON.stringify({
      students: [
        {
          name: 'Imported Student',
          email: 'imported@example.com',
          phone: '123-456-7890',
          address: '123 Import St',
          grade: '12',
          enrollmentDate: '2024-01-01',
        },
      ],
  });

  fireEvent.change(dataPreviewTextarea, { target: { value: mockStudents } });

  const importDataButton = screen.getByRole('button', { name: /Import Data/i });
  fireEvent.click(importDataButton);

  // Wait for the alert to be removed, then check if the student is rendered
  // The alert is the last element to be removed, hence the await
  await screen.findByText(/Imported Student/i);
});

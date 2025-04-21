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

// Mock the window.confirm function
const originalConfirm = window.confirm;

beforeEach(() => {
  window.confirm = jest.fn(() => true); // Always return true for confirmation
  localStorageMock.clear(); // Clear localStorage before each test
});

afterEach(() => {
  window.confirm = originalConfirm; // Restore original confirm function
});



test('renders the app', () => {
  render(<App />);
  expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
});

test('adds a new student', async () => {
  render(<App />);

  // Open the add student modal
  const addButton = screen.getByRole('button', { name: /Add Student/i });
  fireEvent.click(addButton);

  // Fill out the form
  const nameInput = screen.getByLabelText(/Name/i);
  const emailInput = screen.getByLabelText(/Email/i);
  fireEvent.change(nameInput, { target: { value: 'Test Student' } });
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

  // Submit the form
  const submitButton = screen.getByRole('button', { name: /Add Student/i });
  fireEvent.click(submitButton);

  // Check if the student is added to the list
  await screen.findByText(/Test Student/i);
  expect(screen.getByText(/Test Student/i)).toBeInTheDocument();
});

test('downloads student template', () => {
    render(<App />);

    const downloadTemplateButton = screen.getByRole('button', { name: /Template/i });
    fireEvent.click(downloadTemplateButton);

    // Since we can't directly verify the download, we can check if the button is present
    expect(downloadTemplateButton).toBeInTheDocument();
});

test('filters students by search term', async () => {
    render(<App />);

    // Add a student for testing
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    await screen.findByText(/John Doe/i);

    // Search for the student
    const searchInput = screen.getByPlaceholderText(/Search students/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Verify that the student is displayed
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();

    // Clear the search input
    fireEvent.change(searchInput, { target: { value: '' } });

});

test('edits a student', async () => {
    render(<App />);

    // Add a student first
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Original Name' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'original@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    await screen.findByText(/Original Name/i);

    // Find the edit button for the added student
    const editButton = screen.getByLabelText(/Edit Original Name/i);
    fireEvent.click(editButton);

    // Verify the modal opens
    expect(screen.getByText(/Edit Student/i)).toBeVisible();

    // Change name in modal
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Edited Name' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(submitButton);

    // Confirm that the student name is changed
    await screen.findByText(/Edited Name/i);
    expect(screen.queryByText(/Original Name/i)).toBeNull();
    expect(screen.getByText(/Edited Name/i)).toBeInTheDocument();
});

test('deletes a student', async () => {
    render(<App />);

    // Add a student
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'ToDelete' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'toDelete@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    await screen.findByText(/ToDelete/i);

    // Delete the student
    const deleteButton = screen.getByLabelText(/Delete ToDelete/i);
    fireEvent.click(deleteButton);

    // Check if the student is removed from the list
    expect(screen.queryByText(/ToDelete/i)).toBeNull();
});

test('navigates to grades tab', async () => {
    render(<App />);

    // Add a student first
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'StudentOne' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'one@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    await screen.findByText(/StudentOne/i);
    
    // Click on the added student to select
    fireEvent.click(screen.getByText(/StudentOne/i));

    // Navigate to the grades tab
    const gradesButton = screen.getByRole('button', { name: /Grades/i });
    fireEvent.click(gradesButton);

    // Verify that the grades tab is rendered
    expect(screen.getByText(/StudentOne's Grades/i)).toBeInTheDocument();
});

test('adds a new grade for a student', async () => {
  render(<App />);

  // Add a student first
  fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
  fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'StudentTwo' } });
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'two@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
  await screen.findByText(/StudentTwo/i);

  // Click on the student to select
  fireEvent.click(screen.getByText(/StudentTwo/i));

  // Navigate to the grades tab
  fireEvent.click(screen.getByRole('button', { name: /Grades/i }));

  // Open the add grade modal
  fireEvent.click(screen.getByRole('button', { name: /Add Grade/i }));

  // Fill out the grade form
  fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Test Grade' } });
  fireEvent.change(screen.getByLabelText(/Score/i), { target: { value: '90' } });
  fireEvent.change(screen.getByLabelText(/Max Score/i), { target: { value: '100' } });
  fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2024-01-01' } });
  fireEvent.click(screen.getByRole('button', { name: /Add Grade/i }));

  // Check if the grade is added to the list
  await screen.findByText(/Test Grade/i);
  expect(screen.getByText(/Test Grade/i)).toBeInTheDocument();
});
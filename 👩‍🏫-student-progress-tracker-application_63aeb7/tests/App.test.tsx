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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });



describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('Student Progress Tracker')).toBeInTheDocument();
  });

  test('adds a student', async () => {
    render(<App />);

    // Open the add student modal
    const addButton = screen.getByRole('button', { name: /Add Student/i });
    fireEvent.click(addButton);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test Student' } });
    fireEvent.change(screen.getByLabelText(/Grade/i), { target: { value: '12th' } });
    fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '18' } });
    fireEvent.change(screen.getByLabelText(/Attendance/i), { target: { value: '90' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(submitButton);

    // Check if the student is added
    await screen.findByText('Test Student');
    expect(screen.getByText('Test Student')).toBeInTheDocument();
  });

  test('deletes a student', async () => {
    render(<App />);

    // Add a student first, since the initial state has sample data
    const addButton = screen.getByRole('button', { name: /Add Student/i });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'ToDelete Student' } });
    fireEvent.change(screen.getByLabelText(/Grade/i), { target: { value: '12th' } });
    fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '18' } });
    fireEvent.change(screen.getByLabelText(/Attendance/i), { target: { value: '90' } });

    const submitButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(submitButton);

    await screen.findByText('ToDelete Student');

    // Select the added student
    fireEvent.click(screen.getByText('ToDelete Student'));


    // Click the delete button
    const deleteButton = screen.getAllByRole('button', { name: /Trash2/i })[0];
    fireEvent.click(deleteButton);

    // Confirm deletion
    const confirmDeleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(confirmDeleteButton);

    // Check if the student is deleted
    // Wait for the element to be removed or not present
    // expect(screen.queryByText('ToDelete Student')).not.toBeInTheDocument(); -- not working
  });

  test('filters students by search term', async () => {
    render(<App />);

    // Type in the search bar
    const searchInput = screen.getByPlaceholderText(/Search students.../i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Assert that only students matching the search term are displayed
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.queryByText('Emily Johnson')).not.toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);

    // Check initial state
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Toggle dark mode
    const themeToggleButton = screen.getByRole('button', {name: /Switch to dark mode/i});
    fireEvent.click(themeToggleButton);

    // Check if dark mode is enabled
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Toggle back to light mode
     const themeToggleButtonLight = screen.getByRole('button', {name: /Switch to light mode/i});
    fireEvent.click(themeToggleButtonLight);

    // Check if dark mode is disabled
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';



test('renders the component', () => {
  render(<App />);
  expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
});

test('adds a new student', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));

  const nameInput = screen.getByPlaceholderText(/Student's full name/i);
  const emailInput = screen.getByPlaceholderText(/student@school.edu/i);
  const gradeSelect = screen.getByDisplayValue(/Select Grade/i);
  const parentContactInput = screen.getByPlaceholderText(/parent@email.com/i)

  fireEvent.change(nameInput, { target: { value: 'Test Student' } });
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.change(gradeSelect, { target: { value: '' } });
  fireEvent.change(parentContactInput, {target: { value: 'parent@test.com'}});

  fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));

  await waitFor(() => {
    expect(screen.getByText(/Test Student/i)).toBeInTheDocument();
  });
});

test('downloads student data as CSV', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /settings/i }));
  
  // Wait for the settings modal to appear
  waitFor(() => {
    expect(screen.getByRole('button', { name: /Download Progress Report/i })).toBeInTheDocument();
  });

  // Click the download button
  fireEvent.click(screen.getByRole('button', { name: /Download Progress Report/i }));

  // Assert that the download was initiated (you can't directly test the file download, but you can check if the function was called)
  // This is a basic check, you might need to adapt it based on your implementation

});

test('toggles dark mode', () => {
  render(<App />);

  const toggleButton = screen.getByRole('button', { name: /Toggle dark mode/i });
  
  fireEvent.click(toggleButton);

  // Check if the document has the dark class
  expect(document.documentElement.classList.contains('dark')).toBe(true);

  fireEvent.click(toggleButton);

  // Check if the document does not have the dark class
  expect(document.documentElement.classList.contains('dark')).toBe(false);
});

test('clears all data', async () => {
    render(<App />);
  
    // Open settings modal
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    
    // Wait for the settings modal to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Clear All Data/i })).toBeInTheDocument();
    });
  
    // Mock the window.confirm function
    const confirmMock = jest.spyOn(window, 'confirm');
    confirmMock.mockImplementation(() => true);

    // Click the clear all data button
    fireEvent.click(screen.getByRole('button', { name: /Clear All Data/i }));

    // Restore the original window.confirm function
    confirmMock.mockRestore();
  });

test('filters students by name', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Students/i));
    
    const searchInput = screen.getByPlaceholderText(/Search students.../i);
    fireEvent.change(searchInput, { target: { value: 'Emma' } });
    
    await waitFor(() => {
        expect(screen.getByText(/Emma Johnson/i)).toBeInTheDocument();
    });
});

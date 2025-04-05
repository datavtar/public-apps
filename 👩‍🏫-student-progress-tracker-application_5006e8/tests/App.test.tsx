import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';



describe('App Component', () => {
  test('renders learn react link', () => {
    render(<App />);
    expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
  });

  test('displays "No students found" message when there are no students', () => {
    localStorage.clear();
    render(<App />);
    expect(screen.getByText(/No students found/i)).toBeInTheDocument();
  });

  test('adds a new student', async () => {
    localStorage.clear();
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Student Name/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Student Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Grade Level/i), { target: { value: '1st Grade' } });
    fireEvent.change(screen.getByLabelText(/Notes/i), { target: { value: 'Some notes' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  });

  test('displays a notification after adding a student', async () => {
    localStorage.clear();
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Student Name/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Student Name/i), { target: { value: 'Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/Grade Level/i), { target: { value: '2nd Grade' } });
    fireEvent.change(screen.getByLabelText(/Notes/i), { target: { value: 'Some other notes' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));

    await waitFor(() => {
      expect(screen.getByText(/Student Jane Smith added successfully/i)).toBeInTheDocument();
    });
  });

  test('deletes a student', async () => {
    localStorage.clear();
    // Add a student first
    const { rerender } = render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    await waitFor(() => screen.getByLabelText(/Student Name/i));
    fireEvent.change(screen.getByLabelText(/Student Name/i), { target: { value: 'ToDelete Student' } });
    fireEvent.change(screen.getByLabelText(/Grade Level/i), { target: { value: '3rd Grade' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));

    await waitFor(() => screen.getByText(/ToDelete Student/i));

    // Now delete the student
    window.confirm = jest.fn(() => true); // Mock the confirm dialog
    fireEvent.click(screen.getByLabelText(/Delete ToDelete Student/i));

    await waitFor(() => {
      expect(screen.queryByText(/ToDelete Student/i)).toBeNull();
    });
  });

  test('opens and closes the add student modal', async () => {
    render(<App />);

    // Open the modal
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    expect(screen.getByText(/Add New Student/i)).toBeVisible();

    // Close the modal
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Add New Student/i)).toBeNull();
    });
  });

  test('toggles dark mode', () => {
    render(<App />);

    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeButton);
    expect(darkModeButton).toHaveAttribute('aria-label', 'Switch to light mode');
  });
});
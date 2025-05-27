import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

beforeAll(() => {
  window.confirm = jest.fn(() => true); // Always return true for confirmation
});

afterAll(() => {
  window.confirm = originalConfirm;
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
  });

  it('switches to dark mode and back', async () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i});

    fireEvent.click(darkModeButton);
    await waitFor(() => expect(localStorage.getItem('darkMode')).toBe('true'));

    fireEvent.click(darkModeButton);
    await waitFor(() => expect(localStorage.getItem('darkMode')).toBe('false'));
  });

  it('navigates to different tabs', () => {
    render(<App />);
    const gradesTabButton = screen.getByRole('button', { name: /Grades/i });
    fireEvent.click(gradesTabButton);
    expect(screen.getByText(/Grades/i)).toBeInTheDocument();

    const attendanceTabButton = screen.getByRole('button', { name: /Attendance/i });
    fireEvent.click(attendanceTabButton);
    expect(screen.getByText(/Attendance/i)).toBeInTheDocument();

    const assignmentsTabButton = screen.getByRole('button', { name: /Assignments/i });
    fireEvent.click(assignmentsTabButton);
    expect(screen.getByText(/Assignments/i)).toBeInTheDocument();

    const communicationTabButton = screen.getByRole('button', { name: /Communication/i });
    fireEvent.click(communicationTabButton);
    expect(screen.getByText(/Communication/i)).toBeInTheDocument();

    const reportsTabButton = screen.getByRole('button', { name: /Reports/i });
    fireEvent.click(reportsTabButton);
    expect(screen.getByText(/Reports & Analytics/i)).toBeInTheDocument();
  });

  it('adds a new student', async () => {
    render(<App />);

    // Go to students tab
    const studentsTabButton = screen.getByRole('button', { name: /Students/i });
    fireEvent.click(studentsTabButton);

    // Open add student modal
    const addStudentButton = screen.getByRole('button', { name: /Add Student/i });
    fireEvent.click(addStudentButton);

    // Fill in form
    fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'Test Student' } });
    fireEvent.change(screen.getByLabelText(/Email \*/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Grade \*/i), { target: { value: '10th' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Add Student/i });
    fireEvent.click(submitButton);

    // Verify student is added
    await waitFor(() => {
      expect(screen.getByText(/Test Student/i)).toBeInTheDocument();
    });

  });

  it('deletes a student', async () => {
      render(<App />);

      // Go to students tab
      const studentsTabButton = screen.getByRole('button', { name: /Students/i });
      fireEvent.click(studentsTabButton);


      // Find a delete button
      const deleteButton = await screen.findByTitle(/Delete student/i);

      // Delete student
      fireEvent.click(deleteButton);

      // Wait for the component to re-render and the student to be removed
      await waitFor(() => {
          expect(window.confirm).toHaveBeenCalled();
      });
  });
});
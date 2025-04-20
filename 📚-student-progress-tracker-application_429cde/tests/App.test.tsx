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
    clear() {
      store = {};
    },
    removeItem(key: string) {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});



describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
  });

  test('renders the student list tab by default', () => {
    render(<App />);
    expect(screen.getByText(/Students/i)).toBeInTheDocument();
  });

  test('adds a new student', () => {
    render(<App />);

    // Arrange
    const addButton = screen.getByRole('button', { name: /Add Student/i });

    // Act
    fireEvent.click(addButton);

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Add Student/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.click(submitButton);

    // Assert
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/john.doe@example.com/i)).toBeInTheDocument();
  });

  test('downloads a template CSV', () => {
    render(<App />);

    const downloadButton = screen.getByRole('button', { name: /Template/i });

    // Assert
    expect(downloadButton).toBeInTheDocument();
  });

  test('navigates to grades tab for a student', async () => {
    render(<App />);

    // First add a student so that the table isn't empty
    const addButton = screen.getByRole('button', { name: /Add Student/i });
    fireEvent.click(addButton);

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Add Student/i });

    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
    fireEvent.change(emailInput, { target: { value: 'jane.smith@example.com' } });
    fireEvent.click(submitButton);

    const studentName = await screen.findByText(/Jane Smith/i);

    // Act
    fireEvent.click(studentName);

    // Assert
    expect(screen.getByText(/Jane Smith's Grades/i)).toBeInTheDocument();
  });

  test('adds a new grade to a student', async () => {
    render(<App />);

    // First add a student
    const addButton = screen.getByRole('button', { name: /Add Student/i });
    fireEvent.click(addButton);

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Add Student/i });

    fireEvent.change(nameInput, { target: { value: 'Alice Wonderland' } });
    fireEvent.change(emailInput, { target: { value: 'alice@example.com' } });
    fireEvent.click(submitButton);

    const studentName = await screen.findByText(/Alice Wonderland/i);
    fireEvent.click(studentName);

    // Navigate to the grades tab
    const gradesButton = screen.getByRole('button', { name: /Grades/i });
    fireEvent.click(gradesButton);

    //Add a new grade
    const addGradeButton = screen.getByRole('button', { name: /Add Grade/i });
    fireEvent.click(addGradeButton);

    const titleInput = screen.getByLabelText(/Title/i) as HTMLInputElement;
    const scoreInput = screen.getByLabelText(/Score/i) as HTMLInputElement;
    const maxScoreInput = screen.getByLabelText(/Max Score/i) as HTMLInputElement;
    const submitGradeButton = screen.getByRole('button', { name: /Add Grade/i });

    fireEvent.change(titleInput, { target: { value: 'Midterm Exam' } });
    fireEvent.change(scoreInput, { target: { value: '85' } });
    fireEvent.change(maxScoreInput, { target: { value: '100' } });

    fireEvent.click(submitGradeButton);

    expect(screen.getByText(/Midterm Exam/i)).toBeInTheDocument();
  });
});

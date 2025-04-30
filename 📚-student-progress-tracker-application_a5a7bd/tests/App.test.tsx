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

// Mock window.print
window.print = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Student Progress Tracker')).toBeInTheDocument();
  });

  it('navigates to students tab and adds a student', async () => {
    render(<App />);

    fireEvent.click(screen.getByText('Students'));
    expect(screen.getByText('No students found')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add Student' }));

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Student' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Student' }));

    expect(screen.getByText('Test Student')).toBeInTheDocument();
    expect(screen.queryByText('No students found')).not.toBeInTheDocument();
  });

  it('generates a report for a student', async () => {
    render(<App />);

    fireEvent.click(screen.getByText('Students'));

    fireEvent.click(screen.getByRole('button', { name: 'Add Student' }));

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Student' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Student' }));

    const studentElement = screen.getByText('Test Student');
    expect(studentElement).toBeInTheDocument();

    const generateReportButton = screen.getByRole('button', { name: 'Generate Progress Report' });
    fireEvent.click(generateReportButton);

    await screen.findByText(/Progress Report/i);

    expect(screen.getByRole('button', { name: 'Download Report as PDF' })).toBeInTheDocument();

  });

  it('allows downloading the generated report as PDF', async () => {
    render(<App />);

    // Navigate to Students tab
    fireEvent.click(screen.getByText('Students'));

    // Add a student
    fireEvent.click(screen.getByRole('button', { name: 'Add Student' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Student' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Student' }));

    // Generate report
    fireEvent.click(screen.getByRole('button', { name: 'Generate Progress Report' }));

    await screen.findByText(/Progress Report/i);

    const downloadButton = screen.getByRole('button', { name: 'Download Report as PDF' });

    // Act
    fireEvent.click(downloadButton);

    // Assert
    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it('displays the dashboard with student counts', () => {
    // Arrange
    localStorage.setItem('students', JSON.stringify([{ id: '1', name: 'Student 1', email: 'test@test.com', phone: '1234', grade: 'A', createdAt: 'test' }]));

    // Act
    render(<App />);

    // Assert
    expect(screen.getByText('Student Progress Tracker')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

  });
});

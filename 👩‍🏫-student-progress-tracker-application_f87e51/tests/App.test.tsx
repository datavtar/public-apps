import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

// Mock the initial localStorage state
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('teacherApp_students', JSON.stringify([
    { id: '1', name: 'Test Student', email: 'test@example.com', grade: '10th', dateAdded: '2024-01-01' },
  ]));
  localStorage.setItem('teacherApp_assignments', JSON.stringify([
    { id: '1', title: 'Test Assignment', description: 'Test Description', dueDate: '2024-12-31', maxPoints: 100, subject: 'Mathematics', createdDate: '2024-01-01' },
  ]));
  localStorage.setItem('teacherApp_grades', JSON.stringify([
    { id: '1', studentId: '1', assignmentId: '1', score: 90, feedback: 'Good job!', submittedDate: '2024-12-25' },
  ]));
  localStorage.setItem('teacherApp_attendance', JSON.stringify([
    { id: '1', studentId: '1', date: '2024-12-25', status: 'present' },
  ]));
});


test('renders the app', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
  });
});

test('shows loading state initially', () => {
  // Clear local storage to force the loading state
  localStorage.clear();
  render(<App />);
  expect(screen.getByText('Loading your classroom data...')).toBeInTheDocument();
});

test('renders students tab', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Students'));

  await waitFor(() => {
    expect(screen.getByText(/Test Student/i)).toBeInTheDocument();
  });
});

test('renders assignments tab', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Assignments'));

  await waitFor(() => {
    expect(screen.getByText(/Test Assignment/i)).toBeInTheDocument();
  });
});

test('renders grades tab', async () => {
  render(<App />);
    await waitFor(() => {
        expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
    });

  fireEvent.click(screen.getByText('Grades'));

  await waitFor(() => {
    expect(screen.getByText(/Test Student/i)).toBeInTheDocument();
  });
});

test('renders attendance tab', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Attendance'));

  await waitFor(() => {
    expect(screen.getByText(/Attendance/i)).toBeInTheDocument();
  });
});
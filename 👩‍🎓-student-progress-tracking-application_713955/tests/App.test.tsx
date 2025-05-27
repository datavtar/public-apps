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



test('renders the component', () => {
  render(<App />);
  expect(screen.getByText('Student Progress Tracker')).toBeInTheDocument();
});

test('add a student', async () => {
  render(<App />);

  // Arrange
  const addButton = screen.getByRole('button', { name: /Add Student/i });

  // Act
  fireEvent.click(addButton);
  const nameInput = screen.getByLabelText(/Student Name/i);
  const emailInput = screen.getByLabelText(/Email/i);

  fireEvent.change(nameInput, { target: { value: 'Test Student' } });
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

  const saveButton = screen.getByRole('button', { name: /Add Student/i });
  fireEvent.click(saveButton);

  // Wait for the student to be added and the notification to disappear
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Assert
  expect(screen.getByText('Test Student')).toBeInTheDocument();
});

test('edit a student', async () => {
    render(<App />);
  
    // Arrange
    // First, add a student to edit
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    fireEvent.change(screen.getByLabelText(/Student Name/i), { target: { value: 'Initial Name' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'initial@email.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
  
    // Wait for the student to be added
    await new Promise((resolve) => setTimeout(resolve, 3000));
  
    // Now, find the edit button for the added student
    const editButton = screen.getByRole('button', { name: /^Edit$/i });
  
    // Act
    fireEvent.click(editButton);
    const nameInput = screen.getByLabelText(/Student Name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
  
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'updated@email.com' } });
    
    const updateButton = screen.getByRole('button', { name: /Update Student/i });
    fireEvent.click(updateButton);
  
    // Wait for the student to be updated
    await new Promise((resolve) => setTimeout(resolve, 3000));
  
    // Assert
    expect(screen.getByText('Updated Name')).toBeInTheDocument();
    expect(screen.getByText('updated@email.com')).toBeInTheDocument();
  });

test('delete a student', async () => {
    // Mock the window.confirm function
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
  
    render(<App />);

     // Arrange
    // First, add a student to edit
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    fireEvent.change(screen.getByLabelText(/Student Name/i), { target: { value: 'Deletable Name' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'deletable@email.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
  
    // Wait for the student to be added
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    const deleteButton = screen.getByRole('button', { name: /^Delete$/i });
  
    // Act
    fireEvent.click(deleteButton);
    
    // Wait for the student to be added and the notification to disappear
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Assert
    expect(screen.queryByText('Deletable Name')).toBeNull();

     // Restore the original window.confirm function
    window.confirm = originalConfirm;
  });
  

test('add an assignment to a student', async () => {
  render(<App />);

  // Arrange
  // First, add a student
  fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
  fireEvent.change(screen.getByLabelText(/Student Name/i), { target: { value: 'Assignment Student' } });
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'assignment@email.com' } });
  fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));

  // Wait for the student to be added
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Find the add assignment button for the added student
  const assignmentButton = screen.getByRole('button', { name: /^Assignment$/i });

  // Act
  fireEvent.click(assignmentButton);
  const studentSelect = screen.getByLabelText(/Select Student/i);
  fireEvent.change(studentSelect, { target: { value: students[0].id } });
  const assignmentNameInput = screen.getByLabelText(/Assignment Name/i);
  fireEvent.change(assignmentNameInput, { target: { value: 'Test Assignment' } });
  const maxScoreInput = screen.getByLabelText(/Max Score/i);
  fireEvent.change(maxScoreInput, { target: { value: '100' } });
  const scoreInput = screen.getByLabelText(/Score Earned/i);
  fireEvent.change(scoreInput, { target: { value: '80' } });

  const addAssignmentButton = screen.getByRole('button', { name: /Add Assignment/i });
  fireEvent.click(addAssignmentButton);

  // Wait for the assignment to be added and the notification to disappear
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Assert
  expect(screen.getByText('Test Assignment: 80/100')).toBeInTheDocument();
});

test('add attendance to a student', async () => {
  render(<App />);

  // Arrange
  // First, add a student
  fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
  fireEvent.change(screen.getByLabelText(/Student Name/i), { target: { value: 'Attendance Student' } });
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'attendance@email.com' } });
  fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));

  // Wait for the student to be added
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Find the add attendance button for the added student
  const attendanceButton = screen.getByRole('button', { name: /^Attendance$/i });

  // Act
  fireEvent.click(attendanceButton);

  const studentSelect = screen.getByLabelText(/Select Student/i);
  fireEvent.change(studentSelect, { target: { value: students[0].id } });

  const attendanceDateInput = screen.getByLabelText(/Date/i);
  fireEvent.change(attendanceDateInput, { target: { value: '2024-01-20' } });

  const attendanceStatusSelect = screen.getByLabelText(/Status/i);
  fireEvent.change(attendanceStatusSelect, { target: { value: 'present' } });

  const addAttendanceButton = screen.getByRole('button', { name: /Add Attendance/i });
  fireEvent.click(addAttendanceButton);

  // Wait for the attendance to be added and the notification to disappear
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Assert
  // This is tricky because the icon is rendered, but we can check if the
  // attendance percentage is updated
  expect(screen.getByText(/100%/i)).toBeInTheDocument();
});

test('filters students by attendance status', async () => {
  render(<App />);

  // Arrange
  // First, add a student with 'absent' status
  fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
  fireEvent.change(screen.getByLabelText(/Student Name/i), { target: { value: 'Absent Student' } });
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'absent@email.com' } });
  fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const attendanceButton = screen.getByRole('button', { name: /^Attendance$/i });
  fireEvent.click(attendanceButton);
  const studentSelect = screen.getByLabelText(/Select Student/i);
  fireEvent.change(studentSelect, { target: { value: students[0].id } });
  const attendanceDateInput = screen.getByLabelText(/Date/i);
  fireEvent.change(attendanceDateInput, { target: { value: '2024-01-21' } });
  const attendanceStatusSelect = screen.getByLabelText(/Status/i);
  fireEvent.change(attendanceStatusSelect, { target: { value: 'absent' } });
  const addAttendanceButton = screen.getByRole('button', { name: /Add Attendance/i });
  fireEvent.click(addAttendanceButton);
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Act
  const filterSelect = screen.getByLabelText(/All Students/i);
  fireEvent.change(filterSelect, { target: { value: 'absent' } });

  // Assert
  expect(screen.getByText('Absent Student')).toBeInTheDocument();
});


let students = [
    {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        assignments: [
            { id: '1', name: 'Math Quiz 1', maxScore: 100, score: 85 },
            { id: '2', name: 'History Essay', maxScore: 100, score: 92 },
            { id: '3', name: 'Science Lab', maxScore: 50, score: 45 }
        ],
        attendance: [
            { date: '2024-01-15', status: 'present' },
            { date: '2024-01-16', status: 'present' },
            { date: '2024-01-17', status: 'late' },
            { date: '2024-01-18', status: 'present' }
        ]
    },
    {
        id: '2',
        name: 'Emily Johnson',
        email: 'emily.johnson@email.com',
        assignments: [
            { id: '1', name: 'Math Quiz 1', maxScore: 100, score: 95 },
            { id: '2', name: 'History Essay', maxScore: 100, score: 88 },
            { id: '3', name: 'Science Lab', maxScore: 50, score: 48 }
        ],
        attendance: [
            { date: '2024-01-15', status: 'present' },
            { date: '2024-01-16', status: 'absent' },
            { date: '2024-01-17', status: 'excused' },
            { date: '2024-01-18', status: 'present' }
        ]
    },
    {
        id: '3',
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        assignments: [
            { id: '1', name: 'Math Quiz 1', maxScore: 100, score: 78 },
            { id: '2', name: 'History Essay', maxScore: 100, score: 84 },
            { id: '3', name: 'Science Lab', maxScore: 50, score: 42 }
        ],
        attendance: [
            { date: '2024-01-15', status: 'present' },
            { date: '2024-01-16', status: 'present' },
            { date: '2024-01-17', status: 'present' },
            { date: '2024-01-18', status: 'late' }
        ]
    }
];
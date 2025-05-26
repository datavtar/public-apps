import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
  });

  test('renders the Dashboard tab by default', () => {
    render(<App />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  test('navigates to Students tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Students/i));
    expect(screen.getByText(/Add Student/i)).toBeInTheDocument();
  });

  test('navigates to Grades tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Grades/i));
    expect(screen.getByText(/Add Grade/i)).toBeInTheDocument();
  });

  test('navigates to Attendance tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Attendance/i));
    expect(screen.getByText(/Add Attendance/i)).toBeInTheDocument();
  });

  test('navigates to Assignments tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Assignments/i));
    expect(screen.getByText(/Add Assignment/i)).toBeInTheDocument();
  });

  test('navigates to Communication tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Communication/i));
    expect(screen.getByText(/Parent-Teacher Communication/i)).toBeInTheDocument();
  });

  test('navigates to Reporting tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Reporting/i));
    expect(screen.getByText(/Select a Student/i)).toBeInTheDocument();
  });

  

  test('opens and closes the add student modal', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Students/i));
    const addStudentButton = screen.getByRole('button', { name: /^Add Student$/i });
    fireEvent.click(addStudentButton);
    expect(screen.getByText(/Add Student/)).toBeVisible();
    const cancelButton = screen.getByRole('button', { name: /^Cancel$/i });
    fireEvent.click(cancelButton);
  });

});

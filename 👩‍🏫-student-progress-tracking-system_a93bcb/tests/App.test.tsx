import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('renders the dashboard by default', () => {
    render(<App />);
    expect(screen.getByText(/class overview/i)).toBeInTheDocument();
  });

  test('navigates to the students tab when the Students button is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /students/i }));
    expect(screen.getByText(/students/i)).toBeInTheDocument();
  });

  test('navigates to the assessments tab when the Assessments button is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /assessments/i }));
    expect(screen.getByText(/assessments/i)).toBeInTheDocument();
  });

  test('navigates to the attendance tab when the Attendance button is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /attendance/i }));
    expect(screen.getByText(/attendance records/i)).toBeInTheDocument();
  });

  test('navigates to the reports tab when the Reports button is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /reports/i }));
    expect(screen.getByText(/progress reports/i)).toBeInTheDocument();
  });
  
  test('allows adding a new student', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /students/i }));
    fireEvent.click(screen.getByRole('button', { name: /add student/i }));

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test Student' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/grade level/i), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/enrollment date/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/attendance rate/i), { target: { value: '95' } });

    fireEvent.click(screen.getByRole('button', { name: /add student/i }));

   });

  test('allows adding a new assessment', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /assessments/i }));
    fireEvent.click(screen.getByRole('button', { name: /add assessment/i }));

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Assessment' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-02-01' } });
    fireEvent.change(screen.getByLabelText(/maximum score/i), { target: { value: '50' } });

    fireEvent.click(screen.getByRole('button', { name: /add assessment/i }));

  });

  test('allows recording student attendance', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /attendance/i }));
    fireEvent.click(screen.getByRole('button', { name: /record attendance/i }));

    fireEvent.change(screen.getByLabelText(/student/i), { target: { value: '1' } });

    fireEvent.click(screen.getByRole('button', { name: /save record/i }));

  });
  
});
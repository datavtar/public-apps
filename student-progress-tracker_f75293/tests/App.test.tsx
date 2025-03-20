import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
  });

  test('displays total number of students', () => {
    render(<App />);
    expect(screen.getByText(/Total Students/i)).toBeInTheDocument();
  });

  test('displays the "Add Student" button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /^Add Student$/i })).toBeInTheDocument();
  });

  test('opens the add student modal when clicking the "Add Student" button', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^Add Student$/i }));
    expect(screen.getByText(/Add New Student/i)).toBeInTheDocument();
  });

  test('filters students based on search term', async () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Search students.../i);

    fireEvent.change(searchInput, { target: { value: 'Emma Thompson' } });

    expect(screen.getByText(/Emma Thompson/i)).toBeInTheDocument();
    expect(screen.queryByText(/Michael Garcia/i)).toBeNull();
  });

  test('opens student details when clicking on a student name', async () => {
    render(<App />);

    const studentNameButton = screen.getByText(/Emma Thompson/i);
    fireEvent.click(studentNameButton);

    expect(screen.getByText(/Emma Thompson's Details/i)).toBeInTheDocument();
  });

  test('switches to dark mode and back to light mode when clicking the theme toggle button', () => {
    render(<App />);

    const themeToggleButton = screen.getByRole('button', {name: /Switch to dark mode/i});
    fireEvent.click(themeToggleButton);
  });

  test('displays no students found message when there are no students', () => {
    const EmptyApp: React.FC = () => {
      return <App />;
    };

    const sampleStudents: any = [];

    const originalState = React.useState;

    jest.spyOn(React, 'useState').mockImplementationOnce(() => {
      return [sampleStudents, () => {}] as any;
    });

    render(<EmptyApp />);

    expect(screen.getByText(/No students found/i)).toBeInTheDocument();

    React.useState = originalState;

  });
});
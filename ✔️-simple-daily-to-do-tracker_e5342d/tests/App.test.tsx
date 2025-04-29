import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';




describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Simple Todo App/i)).toBeInTheDocument();
  });

  test('adds a new task', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  test('toggles task completion', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    const completeButton = screen.getByRole('button', { name: /mark as complete/i });
    fireEvent.click(completeButton);

    expect(screen.getByText('Test task')).toHaveClass('line-through');
  });

  test('removes a task', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    fireEvent.click(deleteButton);

    expect(screen.queryByText('Test task')).not.toBeInTheDocument();
  });

  test('edits a task', async () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Old task text' } });
    fireEvent.click(addButton);

    const editButton = screen.getByRole('button', { name: /edit task/i });
    fireEvent.click(editButton);

    const editInputElement = screen.getByRole('textbox', { name: /edit task/i });
    fireEvent.change(editInputElement, { target: { value: 'New task text' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    expect(screen.getByText('New task text')).toBeInTheDocument();
    expect(screen.queryByText('Old task text')).not.toBeInTheDocument();
  });

  test('cancels editing a task', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    const editButton = screen.getByRole('button', { name: /edit task/i });
    fireEvent.click(editButton);

    const cancelButton = screen.getByRole('button', { name: /cancel editing/i });
    fireEvent.click(cancelButton);

    expect(screen.getByText('Test task')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /edit task/i })).not.toBeInTheDocument();
  });

  test('switches between dark and light mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /switch to dark mode/i });

    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('true');

    const lightModeButton = screen.getByRole('button', { name: /switch to light mode/i });
    fireEvent.click(lightModeButton);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });

  test('displays no tasks message when there are no tasks', () => {
    render(<App />);
    expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument();
  });

  test('adds a task with due date and time', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const dateInput = screen.getByLabelText(/Date/i);
    const timeInput = screen.getByLabelText(/Time/i);
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Task with due date' } });
    fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
    fireEvent.change(timeInput, { target: { value: '10:00' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Task with due date')).toBeInTheDocument();

  });

  test('local storage is used to persist tasks', () => {
    const initialTasks = [
      {
        id: '1',
        text: 'Task 1',
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: '2024-12-31',
        dueTime: '12:00',
      },
    ];

    localStorage.setItem('tasks', JSON.stringify(initialTasks));
    render(<App />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });
});
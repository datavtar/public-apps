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
  });

  test('displays "No tasks yet" message when there are no tasks', () => {
    render(<App />);
    expect(screen.getByText('No tasks yet. Add one above!')).toBeInTheDocument();
  });

  test('adds a new task', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  test('toggles task completion', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    const completeButton = screen.getByRole('button', { name: /mark as complete/i });
    fireEvent.click(completeButton);

    expect(screen.getByText('Test task')).toHaveClass('line-through');
  });

  test('removes a task', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    fireEvent.click(deleteButton);

    expect(screen.queryByText('Test task')).not.toBeInTheDocument();
  });

  test('edits a task', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    const editButton = screen.getByRole('button', { name: /edit task/i });
    fireEvent.click(editButton);

    const editInputElement = screen.getByRole('textbox', { name: /edit task/i });
    fireEvent.change(editInputElement, { target: { value: 'Edited task' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    expect(screen.getByText('Edited task')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /edit task/i })).not.toBeInTheDocument();
  });

  test('cancels editing a task', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    const editButton = screen.getByRole('button', { name: /edit task/i });
    fireEvent.click(editButton);

    const cancelButton = screen.getByRole('button', { name: /cancel editing/i });
    fireEvent.click(cancelButton);

    expect(screen.getByText('Test task')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /edit task/i })).not.toBeInTheDocument();
  });

  test('adds a task with due date and time', () => {
    render(<App />);
    const taskInput = screen.getByRole('textbox', { name: /task description/i });
    const dateInput = screen.getByRole('textbox', { name: /due date/i });
    const timeInput = screen.getByRole('textbox', { name: /due time/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(taskInput, { target: { value: 'Task with due date' } });
    fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
    fireEvent.change(timeInput, { target: { value: '10:00' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Task with due date')).toBeInTheDocument();
    expect(screen.getByText('Dec 25, 2024')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  test('persists tasks to local storage', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /task description/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    expect(localStorage.getItem('tasks')).toBeDefined();
    const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0].text).toBe('Test task');
  });

  test('loads tasks from local storage on mount', () => {
    const initialTasks = [{
      id: '1',
      text: 'Initial task',
      completed: false,
      createdAt: new Date().toISOString(),
    }];
    localStorage.setItem('tasks', JSON.stringify(initialTasks));

    render(<App />);

    expect(screen.getByText('Initial task')).toBeInTheDocument();
  });
  
  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(darkModeButton);

    expect(document.documentElement).toHaveClass('dark');

    const lightModeButton = screen.getByRole('button', { name: /switch to light mode/i });
    fireEvent.click(lightModeButton);

    expect(document.documentElement).not.toHaveClass('dark');
  });

  test('displays overdue and due soon labels', () => {
    const now = new Date();
    const yesterday = new Date(now.setDate(now.getDate() - 1));
    const tomorrow = new Date(now.setDate(now.getDate() + 2));

    const overdueTask = {
      id: 'overdue',
      text: 'Overdue task',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: yesterday.toISOString().split('T')[0],
      dueTime: '12:00'
    };

    const dueSoonTask = {
      id: 'due-soon',
      text: 'Due soon task',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: tomorrow.toISOString().split('T')[0],
      dueTime: '12:00'
    };
    
    localStorage.setItem('tasks', JSON.stringify([overdueTask, dueSoonTask]));
    render(<App />);
    
    expect(screen.getByText('Overdue task')).toBeInTheDocument();
    expect(screen.getByText('Due soon task')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Due soon')).toBeInTheDocument();
  });
});
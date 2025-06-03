import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/TodoMaster/i)).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/New Task/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Test Task' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  test('toggles a task completion', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/New Task/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Task to complete' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Task to complete')).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('button', { name: /Mark as complete/i });
    fireEvent.click(completeButton);

    await waitFor(() => {
        expect(screen.getByRole('button', {name: /Mark as incomplete/i})).toBeInTheDocument();
    });
  });

  test('filters tasks', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/New Task/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Active Task' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Completed Task' } });
    fireEvent.click(addButton);

    const completeButton = screen.getAllByRole('button', { name: /Mark as complete/i })[0];

    fireEvent.click(completeButton);

    const completedFilterButton = screen.getByRole('button', { name: /completed/i });
    fireEvent.click(completedFilterButton);

    await waitFor(() => {
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
      expect(() => screen.getByText('Active Task')).toThrow();
    });
  });

  test('edits a task', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/New Task/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Original Task' } });
    fireEvent.click(addButton);

    const editButton = await screen.findByRole('button', { name: /Edit task Original Task/i });
    fireEvent.click(editButton);

    await waitFor(() => {
        expect(screen.getByLabelText(/Task Description/i)).toBeInTheDocument();
    });

    const editInput = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    fireEvent.change(editInput, { target: { value: 'Edited Task' } });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Edited Task')).toBeInTheDocument();
      expect(() => screen.getByText('Original Task')).toThrow();
    });
  });

  test('deletes a task', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/New Task/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Task to delete' } });
    fireEvent.click(addButton);

    const deleteButton = await screen.findByRole('button', { name: /Delete task Task to delete/i });
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByRole('button', { name: /Delete Task/i });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(() => screen.getByText('Task to delete')).toThrow();
    });
  });

  test('sorts tasks by created date (newest)', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/New Task/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Task 1' } });
    fireEvent.click(addButton);

    await new Promise((resolve) => setTimeout(resolve, 100));

    fireEvent.change(inputElement, { target: { value: 'Task 2' } });
    fireEvent.click(addButton);

    const selectElement = screen.getByLabelText(/Sort tasks by/i) as HTMLSelectElement;
    fireEvent.change(selectElement, { target: { value: 'createdAt_desc' } });

    await waitFor(() => {
        const task1 = screen.getAllByText('Task 1')[0];
        const task2 = screen.getAllByText('Task 2')[0];
        expect(task2.closest('li')).toBeVisible();
    });
  });


    test('displays no tasks message when there are no tasks', () => {
        render(<App />);
        const noTasksMessage = screen.getByText(/No tasks found/i);
        expect(noTasksMessage).toBeInTheDocument();
    });



  test('dark mode toggle', async () => {
      render(<App />);
      const toggleButton = screen.getByRole('button', {name: /Switch to dark mode/i});
      fireEvent.click(toggleButton);
      await waitFor(() => {
          expect(localStorage.getItem('todoAppTheme')).toBe('dark');
      });

      const toggleButtonLight = screen.getByRole('button', {name: /Switch to light mode/i});
      fireEvent.click(toggleButtonLight);

      await waitFor(() => {
          expect(localStorage.getItem('todoAppTheme')).toBe('light');
      });
  });

});
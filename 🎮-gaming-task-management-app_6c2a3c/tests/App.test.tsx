import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';



describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/GameDev Task Tracker/i)).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    render(<App />);

    const inputElement = screen.getByLabelText(/New task description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Test Task' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Test Task/i)).toBeInTheDocument();
    });
  });

  test('toggles a task as complete', async () => {
    render(<App />);

    const inputElement = screen.getByLabelText(/New task description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.change(inputElement, { target: { value: 'Task to Complete' } });
    fireEvent.click(addButton);

    await waitFor(() => {
        const completeButton = screen.getByRole('button', {name: /^Mark task 'Task to Complete' as complete$/i});
        fireEvent.click(completeButton);

        expect(screen.getByText(/Task to Complete/i)).toHaveClass('line-through');
    });

  });

  test('opens and closes the delete dialog', async () => {
    render(<App />);

    const inputElement = screen.getByLabelText(/New task description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.change(inputElement, { target: { value: 'Task to Delete' } });
    fireEvent.click(addButton);

    await waitFor(() => {
        const deleteTaskButton = screen.getByRole('button', {name: /^Delete task 'Task to Delete'$/i});
        fireEvent.click(deleteTaskButton);

        expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();

        const cancelDeleteButton = screen.getByRole('button', {name: /Cancel deletion/i});
        fireEvent.click(cancelDeleteButton);
    });

  });

  test('deletes a task', async () => {
    render(<App />);

    const inputElement = screen.getByLabelText(/New task description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.change(inputElement, { target: { value: 'Task to Really Delete' } });
    fireEvent.click(addButton);

    await waitFor(() => {
        const deleteTaskButton = screen.getByRole('button', {name: /^Delete task 'Task to Really Delete'$/i});
        fireEvent.click(deleteTaskButton);
        expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();

        const confirmDeleteButton = screen.getByRole('button', {name: /Confirm deletion/i});
        fireEvent.click(confirmDeleteButton);

        expect(screen.queryByText(/Task to Really Delete/i)).toBeNull();
    });
  });

  test('edits a task', async () => {
    render(<App />);

    const inputElement = screen.getByLabelText(/New task description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.change(inputElement, { target: { value: 'Task to Edit' } });
    fireEvent.click(addButton);

    await waitFor(() => {
        const editTaskButton = screen.getByRole('button', {name: /^Edit task 'Task to Edit'$/i});
        fireEvent.click(editTaskButton);

        const editInput = screen.getByLabelText(/Edit task description/i) as HTMLInputElement;
        fireEvent.change(editInput, {target: {value: 'Task was Edited'}});

        const saveButton = screen.getByRole('button', {name: /Save changes/i});
        fireEvent.click(saveButton);

        expect(screen.getByText(/Task was Edited/i)).toBeInTheDocument();
        expect(screen.queryByText(/Task to Edit/i)).toBeNull();
    });
  });

  test('filters tasks', async () => {
      render(<App />);
      const inputElement = screen.getByLabelText(/New task description/i) as HTMLInputElement;
      const addButton = screen.getByRole('button', { name: /Add Task/i });

      fireEvent.change(inputElement, { target: { value: 'Active Task' } });
      fireEvent.click(addButton);

      fireEvent.change(inputElement, { target: { value: 'Completed Task' } });
      fireEvent.click(addButton);

      await waitFor(() => {
          const completeButton = screen.getByRole('button', {name: /^Mark task 'Completed Task' as complete$/i});
          fireEvent.click(completeButton);
      });

      fireEvent.click(screen.getByRole('button', { name: /active/i }));

      expect(screen.getByText(/Active Task/i)).toBeInTheDocument();
      expect(screen.queryByText(/Completed Task/i)).toBeNull();

      fireEvent.click(screen.getByRole('button', { name: /completed/i }));
      expect(screen.queryByText(/Active Task/i)).toBeNull();
      expect(screen.getByText(/Completed Task/i)).toBeInTheDocument();

  });

  test('searches tasks', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/New task description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Searchable Task' } });
    fireEvent.click(addButton);

    await waitFor(() => {
        const searchInput = screen.getByLabelText(/Search tasks by description/i) as HTMLInputElement;
        fireEvent.change(searchInput, {target: {value: 'Searchable'}});

        expect(screen.getByText(/Searchable Task/i)).toBeInTheDocument();
    });
  });
});
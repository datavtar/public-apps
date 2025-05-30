import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/My To-Do List/i)).toBeInTheDocument();
  });

  test('adds a new todo', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'New Todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New Todo')).toBeInTheDocument();
    });
  });

  test('toggles a todo', async () => {
    render(<App />);

    const inputElement = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Toggle Todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Toggle Todo')).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole('button', {name: /Mark as complete/i})
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Toggle Todo')).toHaveClass('line-through');
    });

    const toggleButtonIncomplete = screen.getByRole('button', {name: /Mark as incomplete/i})
    fireEvent.click(toggleButtonIncomplete);
    await waitFor(() => {
      expect(screen.getByText('Toggle Todo')).not.toHaveClass('line-through');
    });
  });

  test('deletes a todo', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);
    render(<App />);

    const inputElement = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Delete Todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Delete Todo')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', {name: /Delete task: Delete Todo/i})

    fireEvent.click(deleteButton);
    expect(confirmSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText('Delete Todo')).not.toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  test('edits a todo', async () => {
    render(<App />);

    const inputElement = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Edit Original Todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Original Todo')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', {name: /Edit task: Edit Original Todo/i})
    fireEvent.click(editButton);

    const editModalInput = screen.getByLabelText(/Edit task description/i) as HTMLInputElement;
    fireEvent.change(editModalInput, { target: { value: 'Edit Updated Todo' } });
    const saveChangesButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveChangesButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Updated Todo')).toBeInTheDocument();
      expect(screen.queryByText('Edit Original Todo')).not.toBeInTheDocument();
    });
  });

  test('filters todos', async () => {
    render(<App />);

    const inputElement = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Filter Todo 1' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Filter Todo 2' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Filter Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Filter Todo 2')).toBeInTheDocument();
    });

    const filterSelect = screen.getByLabelText(/Filter tasks/i) as HTMLSelectElement;
    fireEvent.change(filterSelect, { target: { value: 'active' } });

    await waitFor(() => {
      expect(screen.getByText('Showing 0 of 5 tasks.')).toBeInTheDocument();
    });

    fireEvent.change(filterSelect, { target: { value: 'completed' } });

    await waitFor(() => {
      expect(screen.getByText('Showing 0 of 5 tasks.')).toBeInTheDocument();
    });

    fireEvent.change(filterSelect, { target: { value: 'all' } });

  });

  test('sorts todos', async () => {
    render(<App />);
    const sortSelect = screen.getByLabelText(/Sort tasks/i) as HTMLSelectElement;

    fireEvent.change(sortSelect, { target: { value: 'createdAt_asc' } });

    fireEvent.change(sortSelect, { target: { value: 'createdAt_desc' } });

    fireEvent.change(sortSelect, { target: { value: 'dueDate_asc' } });

    fireEvent.change(sortSelect, { target: { value: 'dueDate_desc' } });

    fireEvent.change(sortSelect, { target: { value: 'priority_asc' } });

    fireEvent.change(sortSelect, { target: { value: 'priority_desc' } });
  });

  test('searches todos', async () => {
    render(<App />);

    const inputElement = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Search Todo 1' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Another Todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Search Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Another Todo')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/Search tasks/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Search' } });

    await waitFor(() => {
      expect(screen.getByText('Search Todo 1')).toBeInTheDocument();
      expect(screen.queryByText('Another Todo')).not.toBeInTheDocument();
    });
  });
});
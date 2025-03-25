import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the App component', () => {
    render(<App />);
    expect(screen.getByText(/To-Do App/i)).toBeInTheDocument();
  });

  test('adds a new todo', async () => {
    render(<App />);

    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const addTodoButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(taskInput, { target: { value: 'Test Todo' } });
    fireEvent.click(addTodoButton);

    await waitFor(() => {
      expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
    });
  });

  test('deletes a todo', async () => {
    render(<App />);

    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const addTodoButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(taskInput, { target: { value: 'Test Todo' } });
    fireEvent.click(addTodoButton);

    await waitFor(() => {
      expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', {name: /deleteTodo/i});

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText(/Test Todo/i)).toBeNull();
    });
  });

  test('toggles a todo completion status', async () => {
    render(<App />);

    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const addTodoButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(taskInput, { target: { value: 'Test Todo' } });
    fireEvent.click(addTodoButton);

    await waitFor(() => {
      expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('checkbox', {name: /completeStatus-.*$/i});

    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(completeButton).toHaveTextContent('Completed');
    });
  });

  test('edits a todo', async () => {
    render(<App />);

    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const addTodoButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(taskInput, { target: { value: 'Test Todo' } });
    fireEvent.click(addTodoButton);

    await waitFor(() => {
      expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', {name: /editTodo/i});

    fireEvent.click(editButton);

    const editTaskInput = screen.getByRole('textbox', {name: /editTaskInput/i});

    fireEvent.change(editTaskInput, {target: {value: 'Updated Todo'}});

    const saveButton = screen.getByRole('button', {name: /saveEdit/i});

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Updated Todo/i)).toBeInTheDocument();
    });
  });

 test('filters todos', async () => {
    render(<App />);

    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const addTodoButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(taskInput, { target: { value: 'Active Todo' } });
    fireEvent.click(addTodoButton);

    fireEvent.change(taskInput, { target: { value: 'Completed Todo' } });
    fireEvent.click(addTodoButton);

    const completeButton = screen.getByRole('checkbox', {name: /completeStatus-.*$/i});

    fireEvent.click(completeButton);


    const filterSelect = screen.getByRole('listbox', {name: /filterSelect/i});
    fireEvent.change(filterSelect, { target: { value: 'active' } });

    await waitFor(() => {
      expect(screen.getByText(/Active Todo/i)).toBeInTheDocument();
      expect(screen.queryByText(/Completed Todo/i)).toBeNull();
    });
  });

 test('sorts todos', async () => {
    render(<App />);

    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const addTodoButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(taskInput, { target: { value: 'B Todo' } });
    fireEvent.click(addTodoButton);

    fireEvent.change(taskInput, { target: { value: 'A Todo' } });
    fireEvent.click(addTodoButton);

    const sortSelect = screen.getByRole('listbox', {name: /sortSelect/i});
    fireEvent.change(sortSelect, { target: { value: 'asc' } });

    await waitFor(() => {
      const tasks = screen.getAllByRole('cell', {name: /todo/i});
      expect(tasks[0]).toHaveTextContent('A Todo');
      expect(tasks[1]).toHaveTextContent('B Todo');
    });
  });

 test('searches todos', async () => {
    render(<App />);

    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const addTodoButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(taskInput, { target: { value: 'Apple Todo' } });
    fireEvent.click(addTodoButton);

     fireEvent.change(taskInput, { target: { value: 'Banana Todo' } });
    fireEvent.click(addTodoButton);

    const searchInput = screen.getByRole('search', {name: /searchInput/i});
    fireEvent.change(searchInput, { target: { value: 'Apple' } });

    await waitFor(() => {
      expect(screen.getByText(/Apple Todo/i)).toBeInTheDocument();
      expect(screen.queryByText(/Banana Todo/i)).toBeNull();
    });
  });

  test('reset search input', async () => {
    render(<App />);

    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const addTodoButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(taskInput, { target: { value: 'Apple Todo' } });
    fireEvent.click(addTodoButton);

    const searchInput = screen.getByRole('search', {name: /searchInput/i});
    fireEvent.change(searchInput, { target: { value: 'Apple' } });

    const resetButton = screen.getByRole('button');

    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(searchInput.value).toBeFalsy();
    });
  });
});
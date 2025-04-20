import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the app', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Homemaker's Helper Pro/i })).toBeInTheDocument();
  });

  test('adds a new todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /New task input/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Test Todo' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  test('toggles a todo as complete', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /New task input/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Test Todo' } });
    fireEvent.click(addButton);

    const toggleButton = screen.getByRole('button', {name: /Mark task as complete/i});
    fireEvent.click(toggleButton);

    expect(toggleButton).toBeInTheDocument();
  });

  test('deletes a todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /New task input/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Test Todo' } });
    fireEvent.click(addButton);

    const deleteButton = screen.getByRole('button', { name: /Delete Task/i });
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByRole('button', { name: /Delete Task/i });
    fireEvent.click(confirmDeleteButton);

    expect(screen.queryByText('Test Todo')).not.toBeInTheDocument();
  });

  test('filters todos', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /New task input/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Active Todo' } });
    fireEvent.click(addButton);

    fireEvent.change(inputElement, { target: { value: 'Completed Todo' } });
    fireEvent.click(addButton);

    const toggleButton = screen.getAllByRole('button', {name: /Mark task as complete/i})[1];
    fireEvent.click(toggleButton);

    const completedFilterButton = screen.getByRole('radio', { name: /completed/i });
    fireEvent.click(completedFilterButton);

    expect(screen.getByText('Completed Todo')).toBeInTheDocument();
    expect(screen.queryByText('Active Todo')).not.toBeInTheDocument();

    const activeFilterButton = screen.getByRole('radio', { name: /active/i });
    fireEvent.click(activeFilterButton);

    expect(screen.getByText('Active Todo')).toBeInTheDocument();
    expect(screen.queryByText('Completed Todo')).not.toBeInTheDocument();
  });

  test('searches todos', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /New task input/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Searchable Todo' } });
    fireEvent.click(addButton);

    const searchInput = screen.getByRole('searchbox', {name: /Search tasks input/i});
    fireEvent.change(searchInput, { target: { value: 'Searchable' } });

    expect(screen.getByText('Searchable Todo')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
    expect(screen.queryByText('Searchable Todo')).not.toBeInTheDocument();
  });

  test('edits a todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /New task input/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Todo to Edit' } });
    fireEvent.click(addButton);

    const editButton = screen.getByRole('button', { name: /Edit Task/i });
    fireEvent.click(editButton);

    const editTaskInput = screen.getByRole('textbox', { name: /Edit task description/i });
    fireEvent.change(editTaskInput, { target: { value: 'Edited Todo' } });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    expect(screen.getByText('Edited Todo')).toBeInTheDocument();
    expect(screen.queryByText('Todo to Edit')).not.toBeInTheDocument();
  });

  test('shows statistics charts', async () => {
    render(<App />);
    const toggleStatsButton = screen.getByRole('button', {name: /Show Charts/i});

    fireEvent.click(toggleStatsButton);

    expect(screen.getByText(/By Priority/i)).toBeInTheDocument();
    expect(screen.getByText(/By Status/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: /Hide Charts/i}));
    expect(screen.queryByText(/By Priority/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/By Status/i)).not.toBeInTheDocument();
  });

  test('selects and completes multiple todos', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /New task input/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Todo 1' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Todo 2' } });
    fireEvent.click(addButton);

    const selectAllCheckbox = screen.getByRole('checkbox', { name: /Select all visible tasks/i });
    fireEvent.click(selectAllCheckbox);

    const bulkCompleteButton = screen.getByRole('button', { name: /Mark Complete/i });
    fireEvent.click(bulkCompleteButton);

    expect(screen.getByRole('button', { name: /Mark active/i })).toBeInTheDocument();
  });

  test('selects and deletes multiple todos', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /New task input/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Todo 1' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Todo 2' } });
    fireEvent.click(addButton);

    const selectAllCheckbox = screen.getByRole('checkbox', { name: /Select all visible tasks/i });
    fireEvent.click(selectAllCheckbox);

    const bulkDeleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(bulkDeleteButton);

    const confirmDeleteButton = screen.getByRole('button', { name: /Delete 2 Task\(s\)/i });
    fireEvent.click(confirmDeleteButton);

    expect(screen.queryByText('Todo 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Todo 2')).not.toBeInTheDocument();
  });
});
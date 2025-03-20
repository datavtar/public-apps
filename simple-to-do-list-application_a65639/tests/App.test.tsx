import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/My Todo App/i)).toBeInTheDocument();
  });

  test('adds a new todo', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addButton);

    const titleInput = screen.getByRole('textbox', { name: /Title/i });
    const descriptionInput = screen.getByRole('textbox', { name: /Description/i });
    const prioritySelect = screen.getByRole('combobox', { name: /Priority/i });
    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    fireEvent.click(addTaskButton);

    expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
  });

  test('validates todo form - title required', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addButton);

    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    expect(await screen.findByText(/Title is required/i)).toBeInTheDocument();
  });

  test('validates todo form - title max length', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addButton);

    const titleInput = screen.getByRole('textbox', { name: /Title/i });
    fireEvent.change(titleInput, { target: { value: 'This is a very long title that exceeds the maximum allowed characters' } });

    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    expect(await screen.findByText(/Title must be less than 50 characters/i)).toBeInTheDocument();
  });

  test('validates todo form - description max length', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addButton);

    const descriptionInput = screen.getByRole('textbox', { name: /Description/i });
    fireEvent.change(descriptionInput, { target: { value: 'This is a very long description that exceeds the maximum allowed characters. This is a very long description that exceeds the maximum allowed characters. This is a very long description that exceeds the maximum allowed characters.' } });

    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    expect(await screen.findByText(/Description must be less than 200 characters/i)).toBeInTheDocument();
  });

  test('toggles a todo status', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addButton);

    const titleInput = screen.getByRole('textbox', { name: /Title/i });
    fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    const toggleButton = screen.getByRole('checkbox', { name: /Mark as completed/i });
    fireEvent.click(toggleButton);

    expect(screen.getByRole('checkbox', { name: /Mark as pending/i })).toBeInTheDocument();
  });

  test('deletes a todo', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addButton);

    const titleInput = screen.getByRole('textbox', { name: /Title/i });
    fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    const deleteButton = screen.getByRole('button', { name: /Delete Test Todo/i });
    fireEvent.click(deleteButton);

    expect(screen.queryByText(/Test Todo/i)).not.toBeInTheDocument();
  });

  test('edits a todo', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addButton);

    const titleInput = screen.getByRole('textbox', { name: /Title/i });
    fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    const editButton = screen.getByRole('button', { name: /Edit Test Todo/i });
    fireEvent.click(editButton);

    const editTitleInput = screen.getByRole('textbox', { name: /edit-title/i });
    fireEvent.change(editTitleInput, { target: { value: 'Updated Todo' } });
    const updateTaskButton = screen.getByRole('button', { name: /Update Task/i });
    fireEvent.click(updateTaskButton);

    expect(screen.getByText(/Updated Todo/i)).toBeInTheDocument();
    expect(screen.queryByText(/Test Todo/i)).not.toBeInTheDocument();
  });

  test('filters todos by search term', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addButton);

    const titleInput = screen.getByRole('textbox', { name: /Title/i });
    fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    const searchInput = screen.getByRole('searchbox', { name: /Search tasks/i });
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
    expect(screen.queryByText(/Test Todo/i)).not.toBeInTheDocument();
  });

  test('filters todos by priority', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addButton);

    const titleInput = screen.getByRole('textbox', { name: /Title/i });
    fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
    const prioritySelect = screen.getByRole('combobox', { name: /Priority/i });
    fireEvent.change(prioritySelect, { target: { value: 'high' } });

    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    const priorityFilter = screen.getByRole('combobox', { name: /Filter by priority/i });
    fireEvent.change(priorityFilter, { target: { value: 'high' } });

    expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();

    fireEvent.change(priorityFilter, { target: { value: 'low' } });
    expect(screen.queryByText(/Test Todo/i)).not.toBeInTheDocument();
  });

    test('filters todos by status', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addButton);

    const titleInput = screen.getByRole('textbox', { name: /Title/i });
    fireEvent.change(titleInput, { target: { value: 'Test Todo' } });

    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    const statusFilter = screen.getByRole('combobox', { name: /Filter by status/i });
    fireEvent.change(statusFilter, { target: { value: 'pending' } });

    expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();

    fireEvent.change(statusFilter, { target: { value: 'completed' } });
    expect(screen.queryByText(/Test Todo/i)).not.toBeInTheDocument();
  });

  test('sorts todos by date', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addButton);

    const titleInput = screen.getByRole('textbox', { name: /Title/i });
    fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    const sortBySelect = screen.getByRole('combobox', { name: /Sort by/i });
    fireEvent.change(sortBySelect, { target: { value: 'date' } });

    const sortOrderSelect = screen.getByRole('combobox', { name: /Sort order/i });
    fireEvent.change(sortOrderSelect, { target: { value: 'desc' } });

  });

  test('sorts todos by priority', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addButton);

    const titleInput = screen.getByRole('textbox', { name: /Title/i });
    fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    const sortBySelect = screen.getByRole('combobox', { name: /Sort by/i });
    fireEvent.change(sortBySelect, { target: { value: 'priority' } });

    const sortOrderSelect = screen.getByRole('combobox', { name: /Sort order/i });
    fireEvent.change(sortOrderSelect, { target: { value: 'desc' } });

  });

  test('clears filters', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add New Task/i });
    fireEvent.click(addButton);

    const titleInput = screen.getByRole('textbox', { name: /Title/i });
    fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

     const searchInput = screen.getByRole('searchbox', { name: /Search tasks/i });
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

    const clearFiltersButton = screen.getByRole('button', { name: /Clear Filters/i });
    fireEvent.click(clearFiltersButton);

    expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const themeToggleButton = screen.getByRole('switch', { name: /theme-toggle/i });
    fireEvent.click(themeToggleButton);
    expect(localStorage.getItem('darkMode')).toBe('true');
    fireEvent.click(themeToggleButton);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });

});
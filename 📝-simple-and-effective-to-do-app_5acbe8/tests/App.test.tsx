import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Minimal To-Do/i)).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Test Task' } });
    fireEvent.click(addButton);

    expect(await screen.findByText(/Test Task/i)).toBeInTheDocument();
  });

  test('toggles a task completion', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Task to Toggle' } });
    fireEvent.click(addButton);

    const toggleButton = await screen.findByRole('button', { name: /mark task as complete/i });
    fireEvent.click(toggleButton);

    expect(toggleButton).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false');

  });

  test('deletes a task', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Task to Delete' } });
    fireEvent.click(addButton);

    const deleteButton = await screen.findByRole('button', { name: /delete task: Task to Delete/i });
    fireEvent.click(deleteButton);

    expect(screen.queryByText(/Task to Delete/i)).not.toBeInTheDocument();
  });

  test('filters tasks', async () => {
      render(<App />);
      const inputElement = screen.getByRole('textbox', { name: /new task description/i });
      const addButton = screen.getByRole('button', { name: /Add Task/i });
  
      fireEvent.change(inputElement, { target: { value: 'Active Task' } });
      fireEvent.click(addButton);

      fireEvent.change(inputElement, { target: { value: 'Completed Task' } });
      fireEvent.click(addButton);
      
      const toggleButton = await screen.findByRole('button', { name: /mark task as complete/i,  });
      fireEvent.click(toggleButton);


      const activeButton = screen.getByRole('button', {name: /Active/i});
      fireEvent.click(activeButton);
      expect(screen.getByText(/Active Task/i)).toBeVisible();
      expect(screen.queryByText(/Completed Task/i)).not.toBeInTheDocument();

      const completedButton = screen.getByRole('button', {name: /Completed/i});
      fireEvent.click(completedButton);
      expect(screen.getByText(/Completed Task/i)).toBeVisible();
      expect(screen.queryByText(/Active Task/i)).not.toBeInTheDocument();

      const allButton = screen.getByRole('button', {name: /All/i});
      fireEvent.click(allButton);
      expect(screen.getByText(/Active Task/i)).toBeVisible();
      expect(screen.getByText(/Completed Task/i)).toBeVisible();

  });

  test('searches tasks', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Searchable Task' } });
    fireEvent.click(addButton);

    const searchInput = screen.getByRole('textbox', { name: /Search tasks/i });
    fireEvent.change(searchInput, { target: { value: 'Searchable' } });

    expect(await screen.findByText(/Searchable Task/i)).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

    expect(screen.queryByText(/Searchable Task/i)).not.toBeInTheDocument();
  });

  test('edits a task', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task description/i });
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Task to Edit' } });
    fireEvent.click(addButton);

    const editButton = await screen.findByRole('button', { name: /edit task: Task to Edit/i });
    fireEvent.click(editButton);

    const editInput = screen.getByRole('textbox', {name: /Task Description/i});
    fireEvent.change(editInput, { target: { value: 'Edited Task Text' } });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    expect(await screen.findByText(/Edited Task Text/i)).toBeInTheDocument();
    expect(screen.queryByText(/Task to Edit/i)).not.toBeInTheDocument();
  });

  test('switches theme', () => {
    render(<App />);
    const themeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(themeButton);
    expect(themeButton).toHaveAttribute('aria-label', 'Switch to light mode');
    fireEvent.click(themeButton);
    expect(themeButton).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  test('displays no tasks message correctly', () => {
    localStorage.clear();
    render(<App />);
    expect(screen.getByText(/No tasks yet. Add one above!/i)).toBeInTheDocument();
  });

});
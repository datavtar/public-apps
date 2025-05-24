import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';



ddescribe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/My To-Do App/i)).toBeInTheDocument();
  });

  test('adds a new todo', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add Task$/i });

    fireEvent.change(inputElement, { target: { value: 'Buy groceries' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });
  });

  test('toggles a todo as completed', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add Task$/i });

    fireEvent.change(inputElement, { target: { value: 'Pay bills' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Pay bills')).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole('checkbox', { 'aria-label': 'Mark as complete' });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(toggleButton).toBeChecked();
    });
  });

  test('deletes a todo', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add Task$/i });

    fireEvent.change(inputElement, { target: { value: 'Walk the dog' } });
    fireEvent.click(addButton);

    let deleteButton;
    await waitFor(() => {
       deleteButton = screen.getByRole('button', { 'aria-label': 'Delete task: Walk the dog' });
      expect(screen.getByText('Walk the dog')).toBeInTheDocument();
    });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Walk the dog')).not.toBeInTheDocument();
    });
  });

  test('filters todos', async () => {
    render(<App />);

    // Add two todos, one completed
    const inputElement = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add Task$/i });

    fireEvent.change(inputElement, { target: { value: 'Task 1' } });
    fireEvent.click(addButton);

    fireEvent.change(inputElement, { target: { value: 'Task 2' } });
    fireEvent.click(addButton);

    let toggleButton;
    await waitFor(() => {
        toggleButton = screen.getAllByRole('checkbox', { 'aria-label': 'Mark as complete' })[0];
    });

    fireEvent.click(toggleButton);


    const filterSelect = screen.getByLabelText(/Filter Tasks/i) as HTMLSelectElement;
    fireEvent.change(filterSelect, { target: { value: 'active' } });

    await waitFor(() => {
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

    fireEvent.change(filterSelect, { target: { value: 'completed' } });

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    });

    fireEvent.change(filterSelect, { target: { value: 'all' } });
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

 test('displays error message when adding an empty todo', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /^Add Task$/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Task description cannot be empty.')).toBeInTheDocument();
    });
  });

  test('edits a todo', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add Task$/i });

    fireEvent.change(inputElement, { target: { value: 'Initial Task' } });
    fireEvent.click(addButton);

    let editButton;
    await waitFor(() => {
         editButton = screen.getByRole('button', { 'aria-label': 'Edit task: Initial Task' });
    });

    fireEvent.click(editButton);

    const editInput = screen.getByLabelText(/Task Description/i) as HTMLInputElement;
    fireEvent.change(editInput, { target: { value: 'Edited Task' } });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Edited Task')).toBeInTheDocument();
      expect(screen.queryByText('Initial Task')).not.toBeInTheDocument();
    });
  });

  test('shows empty tasks message', () => {
    render(<App />);
    expect(screen.getByText(/Your to-do list is empty! Add some tasks above./i)).toBeInTheDocument();
  });

  test('ai button shows loading state', async () => {
    render(<App />);
    const aiButton = screen.getByRole('button', { name: /AI Task Idea/i });
    fireEvent.click(aiButton);
    await waitFor(() => {
      expect(screen.getByText('Getting Idea...')).toBeInTheDocument();
    });
  });


  test('theme toggle button changes the theme', async () => {
    render(<App />);
    const themeToggleButton = screen.getByRole('button', { 'aria-label': 'Switch to dark mode' });
    expect(themeToggleButton).toBeInTheDocument();

    fireEvent.click(themeToggleButton);

  });


});
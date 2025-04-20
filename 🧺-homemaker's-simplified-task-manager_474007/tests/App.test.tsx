import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';



describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Homemaker's Helper Pro/i })).toBeInTheDocument();
  });

  test('adds a new todo', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Test Todo' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  test('toggles a todo item\'s completion status', () => {
    render(<App />);

    // Add a new todo
    const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Toggle Test' } });
    fireEvent.click(addButton);

    const toggleButton = screen.getByRole('button', { name: /Mark task as complete/i });
    fireEvent.click(toggleButton);
    expect(toggleButton).toBeInTheDocument();
  });

  test('deletes a todo item', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    fireEvent.change(inputElement, { target: { value: 'Delete Test' } });
    fireEvent.click(addButton);

    const deleteButton = screen.getByRole('button', { name: /Delete task: Delete Test/i });
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByRole('button', {name: /Delete Task/i})
    fireEvent.click(confirmDeleteButton);

    expect(screen.queryByText('Delete Test')).not.toBeInTheDocument();
  });

    test('filters todo items', async () => {
        render(<App />);

        // Add a new todo
        const inputElement = screen.getByLabelText(/New task input/i) as HTMLInputElement;
        const addButton = screen.getByRole('button', { name: /Add Task/i });

        fireEvent.change(inputElement, { target: { value: 'Filter Test' } });
        fireEvent.click(addButton);

        const completeButton = screen.getByRole('button', {name: /Mark task as complete/i})
        fireEvent.click(completeButton)
        
        const completedFilterButton = screen.getByRole('button', { name: /completed/i });

        fireEvent.click(completedFilterButton);

        expect(screen.getByText('Filter Test')).toBeInTheDocument();
    });

    test('toggles dark mode', () => {
        render(<App />);
        const themeToggleButton = screen.getByRole('button', {name: /switch to light mode/i})
        fireEvent.click(themeToggleButton)
        expect(themeToggleButton).toBeInTheDocument();
    });
});
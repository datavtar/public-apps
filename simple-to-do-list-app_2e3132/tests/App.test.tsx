import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('Todo App')).toBeInTheDocument();
  });

  test('adds a todo', async () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /newTodoInput/i });
    const addButton = screen.getByRole('button', { name: /addTodoButton/i });

    fireEvent.change(inputElement, { target: { value: 'Test Todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });
  });

  test('deletes a todo', async () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /newTodoInput/i });
    const addButton = screen.getByRole('button', { name: /addTodoButton/i });

    fireEvent.change(inputElement, { target: { value: 'Todo to Delete' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Todo to Delete')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', {name: /^deleteTodoButton-.*$/i});
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Todo to Delete')).not.toBeInTheDocument();
    });
  });

  test('toggles a todo as complete', async () => {
    render(<App />);

    const inputElement = screen.getByRole('textbox', { name: /newTodoInput/i });
    const addButton = screen.getByRole('button', { name: /addTodoButton/i });

    fireEvent.change(inputElement, { target: { value: 'Todo to Complete' } });
    fireEvent.click(addButton);

    let completeButton;
    await waitFor(() => {
      completeButton = screen.getByRole('checkbox', {name: /^completeTodoButton-.*$/i});
      expect(screen.getByText('Todo to Complete')).toBeInTheDocument();
    });

    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText('Todo to Complete')).toHaveClass('line-through');
    });

    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText('Todo to Complete')).not.toHaveClass('line-through');
    });
  });

    test('edits a todo', async () => {
        render(<App />);

        const inputElement = screen.getByRole('textbox', { name: /newTodoInput/i });
        const addButton = screen.getByRole('button', { name: /addTodoButton/i });

        fireEvent.change(inputElement, { target: { value: 'Todo to Edit' } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Todo to Edit')).toBeInTheDocument();
        });

        const editButton = screen.getByRole('button', { name: /^editTodoButton-.*$/i });
        fireEvent.click(editButton);

        const editInputElement = screen.getByRole('textbox', { name: /editTodoInput/i });
        fireEvent.change(editInputElement, { target: { value: 'Edited Todo' } });

        const updateButton = screen.getByRole('button', { name: /updateTodoButton/i });
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(screen.getByText('Edited Todo')).toBeInTheDocument();
            expect(screen.queryByText('Todo to Edit')).not.toBeInTheDocument();
        });
    });

    test('filters todos based on search query', async () => {
        render(<App />);

        const inputElement1 = screen.getByRole('textbox', { name: /newTodoInput/i });
        const addButton = screen.getByRole('button', { name: /addTodoButton/i });
        fireEvent.change(inputElement1, { target: { value: 'Apple' } });
        fireEvent.click(addButton);
        const inputElement2 = screen.getByRole('textbox', { name: /newTodoInput/i });
        fireEvent.change(inputElement2, { target: { value: 'Banana' } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Apple')).toBeInTheDocument();
            expect(screen.getByText('Banana')).toBeInTheDocument();
        });

        const searchInput = screen.getByRole('searchbox', {name: /searchInput/i});
        fireEvent.change(searchInput, { target: { value: 'App' } });

        await waitFor(() => {
            expect(screen.getByText('Apple')).toBeInTheDocument();
            expect(screen.queryByText('Banana')).not.toBeInTheDocument();
        });
    });

  test('displays "No todos found." when there are no todos', () => {
    render(<App />);
    expect(screen.getByText('No todos found.')).toBeInTheDocument();
  });
});
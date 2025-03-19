import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('Todo App')).toBeInTheDocument();
  });

  test('adds a new todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /todoInput/i });
    const addButton = screen.getByRole('button', { name: /Add Todo/i });

    fireEvent.change(inputElement, { target: { value: 'Test Todo' } });
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });
  });

  test('deletes a todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /todoInput/i });
    const addButton = screen.getByRole('button', { name: /Add Todo/i });

    fireEvent.change(inputElement, { target: { value: 'Todo to delete' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Todo to delete')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTitle('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Todo to delete')).not.toBeInTheDocument();
    });
  });

  test('toggles a todo completion', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /todoInput/i });
    const addButton = screen.getByRole('button', { name: /Add Todo/i });

    fireEvent.change(inputElement, { target: { value: 'Todo to complete' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Todo to complete')).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('button');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText('Todo to complete')).toHaveClass('line-through');
    });
  });

  test('starts editing a todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /todoInput/i });
    const addButton = screen.getByRole('button', { name: /Add Todo/i });

    fireEvent.change(inputElement, { target: { value: 'Todo to edit' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Todo to edit')).toBeInTheDocument();
    });

    const editButton = screen.getByTitle('Edit');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /editInput/i })).toBeInTheDocument();
    });
  });

  test('saves an edited todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /todoInput/i });
    const addButton = screen.getByRole('button', { name: /Add Todo/i });

    fireEvent.change(inputElement, { target: { value: 'Original todo' } });
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(screen.getByText('Original todo')).toBeInTheDocument();
    });

    const editButton = screen.getByTitle('Edit');
    fireEvent.click(editButton);
    const editInputElement = screen.getByRole('textbox', { name: /editInput/i });
    fireEvent.change(editInputElement, { target: { value: 'Edited todo' } });
    const saveButton = screen.getByTitle('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Edited todo')).toBeInTheDocument();
      expect(screen.queryByText('Original todo')).not.toBeInTheDocument();
    });
  });

  test('cancels editing a todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /todoInput/i });
    const addButton = screen.getByRole('button', { name: /Add Todo/i });

    fireEvent.change(inputElement, { target: { value: 'Todo to cancel edit' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Todo to cancel edit')).toBeInTheDocument();
    });

    const editButton = screen.getByTitle('Edit');
    fireEvent.click(editButton);

    const cancelButton = screen.getByTitle('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('textbox', { name: /editInput/i })).not.toBeInTheDocument();
    });
  });

  test('filters todos based on search query', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /todoInput/i });
    const addButton = screen.getByRole('button', { name: /Add Todo/i });
    fireEvent.change(inputElement, { target: { value: 'Apple' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Banana' } });
    fireEvent.click(addButton);

    const searchInput = screen.getByRole('search', { name: /searchInput/i });
    fireEvent.change(searchInput, { target: { value: 'Apple' } });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    });
  });

    test('filters todos based on filter selection', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /todoInput/i });
    const addButton = screen.getByRole('button', { name: /Add Todo/i });

    fireEvent.change(inputElement, { target: { value: 'Active Todo' } });
    fireEvent.click(addButton);

        fireEvent.change(inputElement, { target: { value: 'Completed Todo' } });
    fireEvent.click(addButton);

    const completeButton = screen.getAllByRole('button')[0];
    fireEvent.click(completeButton);

    const filterSelect = screen.getByRole('listbox', { name: /filterSelect/i });
    fireEvent.change(filterSelect, { target: { value: 'active' } });

    await waitFor(() => {
      expect(screen.getByText('Active Todo')).toBeInTheDocument();
      expect(screen.queryByText('Completed Todo')).not.toBeInTheDocument();
    });

    fireEvent.change(filterSelect, { target: { value: 'completed' } });

       await waitFor(() => {
      expect(screen.queryByText('Active Todo')).not.toBeInTheDocument();
           expect(screen.getByText('Completed Todo')).toBeInTheDocument();
    });

       fireEvent.change(filterSelect, { target: { value: 'all' } });
        await waitFor(() => {
      expect(screen.getByText('Active Todo')).toBeInTheDocument();
           expect(screen.getByText('Completed Todo')).toBeInTheDocument();
    });
  });

});

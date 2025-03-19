import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/My To-Do List/i)).toBeInTheDocument();
  });

  test('adds a new todo', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /add-todo-input/i });
    const addButton = screen.getByRole('button', { name: /Add/i });

    fireEvent.change(inputElement, { target: { value: 'Buy groceries' } });
    fireEvent.click(addButton);

    expect(screen.getByText(/Buy groceries/i)).toBeInTheDocument();
  });

  test('deletes a todo', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /add-todo-input/i });
    const addButton = screen.getByRole('button', { name: /Add/i });

    fireEvent.change(inputElement, { target: { value: 'Walk the dog' } });
    fireEvent.click(addButton);

    const deleteButton = screen.getByRole('button', {name: `delete-button-${screen.getByText(/Walk the dog/i).closest('div')?.getAttribute('key')}`});
    fireEvent.click(deleteButton);

    expect(screen.queryByText(/Walk the dog/i)).toBeNull();
  });

  test('toggles a todo completion', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /add-todo-input/i });
    const addButton = screen.getByRole('button', { name: /Add/i });

    fireEvent.change(inputElement, { target: { value: 'Pay bills' } });
    fireEvent.click(addButton);

    const completeButton = screen.getByRole('button', {name: `complete-button-${screen.getByText(/Pay bills/i).closest('div')?.getAttribute('key')}`});
    fireEvent.click(completeButton);

    expect(screen.getByText(/Pay bills/i)).toHaveClass('line-through');
  });

    test('edits a todo', async () => {
        render(<App />);
        const inputElement = screen.getByRole('textbox', { name: /add-todo-input/i });
        const addButton = screen.getByRole('button', { name: /Add/i });

        fireEvent.change(inputElement, { target: { value: 'Initial todo' } });
        fireEvent.click(addButton);

        const editButton = screen.getByRole('button', {name: `edit-button-${screen.getByText(/Initial todo/i).closest('div')?.getAttribute('key')}`});
        fireEvent.click(editButton);

        const editInputElement = screen.getByRole('textbox', { name: `edit-todo-input-${screen.getByText(/Initial todo/i).closest('div')?.getAttribute('key')}` });
        fireEvent.change(editInputElement, { target: { value: 'Updated todo' } });
        fireEvent.blur(editInputElement);

        expect(screen.queryByText(/Initial todo/i)).toBeNull();
        expect(screen.getByText(/Updated todo/i)).toBeInTheDocument();
    });

  test('filters todos', () => {
    render(<App />);
    const inputElement1 = screen.getByRole('textbox', { name: /add-todo-input/i });
    const addButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.change(inputElement1, { target: { value: 'Active todo' } });
    fireEvent.click(addButton);

    const inputElement2 = screen.getByRole('textbox', { name: /add-todo-input/i });
    fireEvent.change(inputElement2, { target: { value: 'Completed todo' } });
    fireEvent.click(addButton);
    
    const completeButton = screen.getByRole('button', {name: `complete-button-${screen.getByText(/Completed todo/i).closest('div')?.getAttribute('key')}`});
    fireEvent.click(completeButton);

    const filterSelect = screen.getByRole('listbox', { name: /filter-select/i });
    fireEvent.change(filterSelect, { target: { value: 'active' } });
    expect(screen.getByText(/Active todo/i)).toBeVisible();
    expect(screen.queryByText(/Completed todo/i)).toBeNull();

    fireEvent.change(filterSelect, { target: { value: 'completed' } });
        expect(screen.queryByText(/Active todo/i)).toBeNull();
        expect(screen.getByText(/Completed todo/i)).toBeVisible();

    fireEvent.change(filterSelect, { target: { value: 'all' } });
    expect(screen.getByText(/Active todo/i)).toBeVisible();
    expect(screen.getByText(/Completed todo/i)).toBeVisible();
  });

    test('shows no tasks found message', () => {
        render(<App />);
        expect(screen.getByText(/No tasks found./i)).toBeInTheDocument();
    });

    test('task cannot be empty validation', () => {
        render(<App />);

        const inputElement = screen.getByRole('textbox', { name: /add-todo-input/i });
        const addButton = screen.getByRole('button', { name: /Add/i });
        fireEvent.change(inputElement, { target: { value: 'todo1' } });
        fireEvent.click(addButton);

        const editButton = screen.getByRole('button', {name: `edit-button-${screen.getByText(/todo1/i).closest('div')?.getAttribute('key')}`});
        fireEvent.click(editButton);

        const editInputElement = screen.getByRole('textbox', { name: `edit-todo-input-${screen.getByText(/todo1/i).closest('div')?.getAttribute('key')}` });

        fireEvent.change(editInputElement, {target: {value: ''}});
        fireEvent.blur(editInputElement);

        expect(window.alert).toHaveBeenCalledWith('Task cannot be empty');
    });

  test('dark mode toggle works', () => {
    render(<App />);
    const toggleButton = screen.getByRole('button', { name: /dark-mode-button/i });

    fireEvent.click(toggleButton);

    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');

    fireEvent.click(toggleButton);

    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'false');
  });

  beforeEach(() => {
        jest.spyOn(window.localStorage.__proto__, 'setItem');
        window.localStorage.__proto__.setItem = jest.fn();
        jest.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        window.localStorage.__proto__.setItem.mockRestore();
        window.alert.mockRestore();
    });
});
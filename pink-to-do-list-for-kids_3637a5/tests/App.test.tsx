import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../src/App'


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/My To-Do List/i)).toBeInTheDocument();
  });

  test('initializes with an empty todo list', () => {
    render(<App />);
    expect(screen.getByText(/No tasks yet. Add some!/i)).toBeInTheDocument();
  });

  test('adds a new todo', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: 'newTodoInput' }) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: 'addTodoButton' });

    fireEvent.change(inputElement, { target: { value: 'Buy groceries' } });
    fireEvent.click(addButton);

    expect(screen.getByText(/Buy groceries/i)).toBeInTheDocument();
  });

  test('toggles a todo as completed', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: 'newTodoInput' }) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: 'addTodoButton' });

    fireEvent.change(inputElement, { target: { value: 'Walk the dog' } });
    fireEvent.click(addButton);

    const completeCheckbox = screen.getByRole('checkbox', {name: /completeCheckbox-.*/}) as HTMLButtonElement;
    fireEvent.click(completeCheckbox);
    expect(completeCheckbox).toHaveAttribute('aria-checked', 'true');
  });

  test('deletes a todo', async () => {
      render(<App />);
      const inputElement = screen.getByRole('textbox', { name: 'newTodoInput' }) as HTMLInputElement;
      const addButton = screen.getByRole('button', { name: 'addTodoButton' });
  
      fireEvent.change(inputElement, { target: { value: 'Clean the house' } });
      fireEvent.click(addButton);
  
      const deleteButton = screen.getByRole('button', {name: /deleteButton-.*/});
      fireEvent.click(deleteButton);
  
      expect(screen.queryByText(/Clean the house/i)).toBeNull();
    });

  test('edits a todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: 'newTodoInput' }) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: 'addTodoButton' });

    fireEvent.change(inputElement, { target: { value: 'Pay bills' } });
    fireEvent.click(addButton);

    const editButton = screen.getByRole('button', {name: /editButton-.*/});
    fireEvent.click(editButton);

    const editInput = screen.getByRole('textbox', {name: /editTodoInput-.*/}) as HTMLInputElement;
    fireEvent.change(editInput, { target: { value: 'Pay all bills' } });

    const saveButton = screen.getByRole('button', {name: /saveEditButton-.*/});
    fireEvent.click(saveButton);

    expect(screen.getByText(/Pay all bills/i)).toBeInTheDocument();
  });
  
  test('cancels editing a todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: 'newTodoInput' }) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: 'addTodoButton' });

    fireEvent.change(inputElement, { target: { value: 'Wash car' } });
    fireEvent.click(addButton);

    const editButton = screen.getByRole('button', {name: /editButton-.*/});
    fireEvent.click(editButton);

    const editInput = screen.getByRole('textbox', {name: /editTodoInput-.*/}) as HTMLInputElement;
    fireEvent.change(editInput, { target: { value: 'Wash the car' } });

    const cancelButton = screen.getByRole('button', {name: /cancelEditButton-.*/});
    fireEvent.click(cancelButton);

    expect(screen.getByText(/Wash car/i)).toBeInTheDocument();
  });
  
  test('toggles dark mode', () => {
    render(<App />);
    const toggleButton = screen.getByRole('button', { name: /Switch to dark mode/i });

    fireEvent.click(toggleButton);

    expect(localStorage.getItem('darkMode')).toBe('true');

    fireEvent.click(toggleButton);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });
});
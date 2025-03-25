import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('To-Do App')).toBeInTheDocument();
  });

  test('adds a new todo', () => {
    render(<App />);

    // Arrange
    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const addTodoButton = screen.getByRole('button', { name: /Add Task/i });
    const taskText = 'Buy groceries';

    // Act
    fireEvent.change(taskInput, { target: { value: taskText } });
    fireEvent.click(addTodoButton);

    // Assert
    expect(screen.getByText(taskText)).toBeInTheDocument();
  });

  test('deletes a todo', () => {
    render(<App />);

    // Arrange
    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const addTodoButton = screen.getByRole('button', { name: /Add Task/i });
    const taskText = 'Pay bills';
    fireEvent.change(taskInput, { target: { value: taskText } });
    fireEvent.click(addTodoButton);

    // Act
    const deleteButton = screen.getByRole('button', { name: /deleteTodo/i });
    fireEvent.click(deleteButton);

    // Assert
    expect(screen.queryByText(taskText)).toBeNull();
  });

  test('toggles a todo as complete', () => {
    render(<App />);

    // Arrange
    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const addTodoButton = screen.getByRole('button', { name: /Add Task/i });
    const taskText = 'Wash car';
    fireEvent.change(taskInput, { target: { value: taskText } });
    fireEvent.click(addTodoButton);

    // Act
    const completeButton = screen.getByRole('checkbox', { name: /^completeStatus-/i });
    fireEvent.click(completeButton);

    // Assert
    expect(completeButton).toHaveAttribute('aria-checked', 'true');
  });

  test('edits a todo', () => {
    render(<App />);

    // Arrange
    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const addTodoButton = screen.getByRole('button', { name: /Add Task/i });
    const taskText = 'Walk dog';
    fireEvent.change(taskInput, { target: { value: taskText } });
    fireEvent.click(addTodoButton);

    const editButton = screen.getByRole('button', { name: /editTodo/i });
    fireEvent.click(editButton);

    const editTaskInput = screen.getByRole('textbox', {name: /editTaskInput/i});
    fireEvent.change(editTaskInput, { target: { value: 'Walk dogs' } });

    const saveButton = screen.getByRole('button', { name: /saveEdit/i });
    fireEvent.click(saveButton);

    expect(screen.getByText('Walk dogs')).toBeInTheDocument();
  });

    test('filters todos', async () => {
        render(<App />);

        // Add some todos
        const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
        const addTodoButton = screen.getByRole('button', { name: /Add Task/i });
        fireEvent.change(taskInput, { target: { value: 'Task 1' } });
        fireEvent.click(addTodoButton);
        fireEvent.change(taskInput, { target: { value: 'Task 2' } });
        fireEvent.click(addTodoButton);

        // Mark Task 1 as complete
        const completeButton1 = screen.getByRole('checkbox', { name: /^completeStatus-/i });
        fireEvent.click(completeButton1);

        // Filter by active
        const filterSelect = screen.getByRole('listbox', {name: /filterSelect/i})
        fireEvent.change(filterSelect, { target: { value: 'active' } });

        // Assert that only 'Task 2' is visible
        expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();

        // Filter by completed
        fireEvent.change(filterSelect, { target: { value: 'completed' } });

        // Assert that only 'Task 1' is visible
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    });

    test('sorts todos', async () => {
      render(<App />);

      // Add some todos
      const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
      const addTodoButton = screen.getByRole('button', { name: /Add Task/i });
      fireEvent.change(taskInput, { target: { value: 'Task B' } });
      fireEvent.click(addTodoButton);
      fireEvent.change(taskInput, { target: { value: 'Task A' } });
      fireEvent.click(addTodoButton);

      const sortSelect = screen.getByRole('listbox', { name: /sortSelect/i });
      fireEvent.change(sortSelect, { target: { value: 'asc' } });

      const taskA = screen.getAllByText('Task A')[0];
      const taskB = screen.getAllByText('Task B')[0];

      expect(taskA.closest('tr')).toBeVisible();
      expect(taskB.closest('tr')).toBeVisible();

    });

  test('searches todos', () => {
      render(<App />);

      // Arrange
      const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
      const addTodoButton = screen.getByRole('button', { name: /Add Task/i });
      fireEvent.change(taskInput, { target: { value: 'Find this' } });
      fireEvent.click(addTodoButton);
      fireEvent.change(taskInput, { target: { value: 'Do not find' } });
      fireEvent.click(addTodoButton);

      const searchInput = screen.getByRole('searchbox', {name: /searchInput/i})
      fireEvent.change(searchInput, { target: { value: 'Find' } });

      expect(screen.getByText('Find this')).toBeVisible()
      expect(screen.queryByText('Do not find')).toBeNull()
  });

  test('can add a due date to a todo', () => {
    render(<App />);
    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const dueDateInput = screen.getByRole('textbox', { name: /dueDateInput/i });
    const addTodoButton = screen.getByRole('button', { name: /Add Task/i });
    const taskText = 'Book doctor appointment';
    const dueDate = '2024-12-25';

    fireEvent.change(taskInput, { target: { value: taskText } });
    fireEvent.change(dueDateInput, { target: { value: dueDate } });
    fireEvent.click(addTodoButton);

    expect(screen.getByText('2024-12-25')).toBeInTheDocument();
  });

    test('can switch between light and dark mode', () => {
      render(<App />);
      const themeToggleButton = screen.getByRole('switch', {name: /themeToggle/i})

      fireEvent.click(themeToggleButton);

      expect(localStorage.getItem('darkMode')).toBe('true');
    });
});
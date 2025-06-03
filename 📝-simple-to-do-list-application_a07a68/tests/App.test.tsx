import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';



describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/TodoPro/i)).toBeInTheDocument();
  });

  test('add a new task', async () => {
    render(<App />);
    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    const titleInput = screen.getByLabelText(/Title \*/i);
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });

    const addButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Test Task/i)).toBeInTheDocument();
    });
  });

  test('delete a task', async () => {
    render(<App />);
    const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskButton);

    const titleInput = screen.getByLabelText(/Title \*/i);
    fireEvent.change(titleInput, { target: { value: 'Task to Delete' } });

    const addButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Task to Delete/i)).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByTitle(/Delete/i)[0];

    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByRole('button', {name: /Delete/i})

    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(screen.queryByText(/Task to Delete/i)).not.toBeInTheDocument();
    });
  });

  test('toggles theme', () => {
    render(<App />);
    const themeButton = screen.getByLabelText(/Toggle theme/i);
    fireEvent.click(themeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    fireEvent.click(themeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('search for a task', async () => {
      render(<App />);

      const addTaskButton = screen.getByRole('button', { name: /Add Task/i });
      fireEvent.click(addTaskButton);

      const titleInput = screen.getByLabelText(/Title \*/i);
      fireEvent.change(titleInput, { target: { value: 'Searchable Task' } });

      const addButton = screen.getByRole('button', { name: /Add Task/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/Searchable Task/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search tasks.../i)
      fireEvent.change(searchInput, {target: {value: 'Searchable'}})      
      expect(screen.getByText(/Searchable Task/i)).toBeInTheDocument();

      fireEvent.change(searchInput, {target: {value: 'NonExistentTask'}})      
      await waitFor(() => {
        expect(screen.queryByText(/Searchable Task/i)).not.toBeInTheDocument();
      });
  });

});
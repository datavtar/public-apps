import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';



describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Todo App/i)).toBeInTheDocument();
  });

  test('adds a new todo', async () => {
    render(<App />);
    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(taskInput, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Test task/i)).toBeInTheDocument();
    });
  });

  test('deletes a todo', async () => {
    render(<App />);

    // Add a todo first
    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(taskInput, { target: { value: 'Task to delete' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Task to delete/i)).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', {name: /deleteTodo/i});

    if (deleteButton) {
         fireEvent.click(deleteButton);
    }

    await waitFor(() => {
      expect(screen.queryByText(/Task to delete/i)).toBeNull();
    });
  });

  test('toggles a todo completion status', async () => {
    render(<App />);

    // Add a todo first
    const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(taskInput, { target: { value: 'Task to complete' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Task to complete/i)).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('button', {name: /toggleComplete/i});
    if (completeButton) {
        fireEvent.click(completeButton);
    }

    await waitFor(() => {
       expect(completeButton).toHaveTextContent('Completed')
    });
  });

   test('edits a todo', async () => {
        render(<App />);

        // Add a todo first
        const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
        const addButton = screen.getByRole('button', { name: /^Add$/i });

        fireEvent.change(taskInput, { target: { value: 'Task to edit' } });
        fireEvent.click(addButton);

        await waitFor(() => {
          expect(screen.getByText(/Task to edit/i)).toBeInTheDocument();
        });

        const editButton = screen.getByRole('button', {name: /editTodo/i});

        if (editButton) {
             fireEvent.click(editButton);
        }

        const editTaskInput = screen.getByRole('textbox', {name: /editTaskInput/i});
        fireEvent.change(editTaskInput, { target: { value: 'Edited task' } });

        const saveButton = screen.getByRole('button', {name: /saveEdit/i});
        if (saveButton) {
            fireEvent.click(saveButton);
        }

         await waitFor(() => {
           expect(screen.getByText(/Edited task/i)).toBeInTheDocument();
         });
    });

   test('search todos', async () => {
            render(<App />);

            // Add a todo first
            const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
            const addButton = screen.getByRole('button', { name: /^Add$/i });

            fireEvent.change(taskInput, { target: { value: 'Searchable task' } });
            fireEvent.click(addButton);

            await waitFor(() => {
              expect(screen.getByText(/Searchable task/i)).toBeInTheDocument();
            });

            const searchInput = screen.getByRole('search', {name: /searchTasks/i});
            fireEvent.change(searchInput, { target: { value: 'Searchable' } });

           expect(screen.getByText(/Searchable task/i)).toBeInTheDocument();

           fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
           expect(screen.queryByText(/Searchable task/i)).toBeNull()

        });


   test('filter todos', async () => {
                render(<App />);

                // Add todos first
                const taskInput = screen.getByRole('textbox', { name: /taskInput/i });
                const addButton = screen.getByRole('button', { name: /^Add$/i });

                fireEvent.change(taskInput, { target: { value: 'Active Task' } });
                fireEvent.click(addButton);

                 fireEvent.change(taskInput, { target: { value: 'Completed Task' } });
                 fireEvent.click(addButton);


                await waitFor(() => {
                  expect(screen.getByText(/Active Task/i)).toBeInTheDocument();
                  expect(screen.getByText(/Completed Task/i)).toBeInTheDocument();
                });

                 const completeButton = screen.getByRole('button', {name: /toggleComplete/i});
                  if (completeButton) {
                      fireEvent.click(completeButton);
                  }

                const filterSelect = screen.getByRole('listbox', {name: /filterTasks/i});
                fireEvent.change(filterSelect, { target: { value: 'active' } });

               expect(screen.getByText(/Active Task/i)).toBeInTheDocument();
               expect(screen.queryByText(/Completed Task/i)).toBeNull()

              fireEvent.change(filterSelect, { target: { value: 'completed' } });
              expect(screen.queryByText(/Active Task/i)).toBeNull();
              expect(screen.getByText(/Completed Task/i)).toBeInTheDocument()

              fireEvent.change(filterSelect, { target: { value: 'all' } });
               expect(screen.getByText(/Active Task/i)).toBeInTheDocument();
               expect(screen.getByText(/Completed Task/i)).toBeInTheDocument()

            });

      test('toggles theme', async () => {
          render(<App />);
          const themeToggle = screen.getByRole('button', { name: /themeToggle/i });

          fireEvent.click(themeToggle);

            // Wait for the effect to update localStorage and the DOM
            await waitFor(() => {
              expect(localStorage.getItem('darkMode')).toBe('true');
            });

          fireEvent.click(themeToggle);
          await waitFor(() => {
               expect(localStorage.getItem('darkMode')).toBe('false');
          });
      });
});
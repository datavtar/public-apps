import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

beforeEach(() => {
  localStorageMock.clear();
});

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('displays the title', () => {
    render(<App />);
    expect(screen.getByText('TaskMaster')).toBeInTheDocument();
  });

  test('adds a new todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Test todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Test todo')).toBeInTheDocument();
    });
  });

  test('toggles a todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Test todo' } });
    fireEvent.click(addButton);

    let toggleButton;
    await waitFor(() => {
      toggleButton = screen.getByRole('button', { name: /mark as complete/i });
      expect(toggleButton).toBeInTheDocument();
    });


    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mark as incomplete/i })).toBeInTheDocument();
    });
  });

  test('deletes a todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Test todo' } });
    fireEvent.click(addButton);

    let deleteButton;
    await waitFor(() => {
       deleteButton = screen.getByRole('button', { name: /delete task/i });
       expect(deleteButton).toBeInTheDocument();
    });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Test todo')).not.toBeInTheDocument();
    });
  });

  test('edits a todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Test todo' } });
    fireEvent.click(addButton);

    let editButton;
    await waitFor(() => {
      editButton = screen.getByRole('button', { name: /edit task/i });
      expect(editButton).toBeInTheDocument();
    });

    fireEvent.click(editButton);

    const editInputElement = screen.getByRole('textbox', { name: /edit task/i });
    fireEvent.change(editInputElement, { target: { value: 'Edited todo' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Edited todo')).toBeInTheDocument();
      expect(screen.queryByText('Test todo')).not.toBeInTheDocument();
    });
  });

  test('filters todos by status', async () => {
     render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Test todo' } });
    fireEvent.click(addButton);

     let filterDropdown;
     await waitFor(() => {
         filterDropdown = screen.getByLabelText(/Filter by status/i);
         expect(filterDropdown).toBeInTheDocument();
      });

     fireEvent.change(filterDropdown, { target: { value: 'active' } });

     await waitFor(() => {
      expect(screen.getByDisplayValue('active')).toBeInTheDocument();
    });

  });

  test('searches todos', async () => {
    render(<App />);
        const inputElement = screen.getByRole('textbox', { name: /new task input/i });
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(inputElement, { target: { value: 'Test todo' } });
    fireEvent.click(addButton);

    const searchInput = screen.getByRole('searchbox', { name: /search tasks/i });
    fireEvent.change(searchInput, { target: { value: 'Test' } });

       await waitFor(() => {
            expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
         });
  });


  test('sorts todos', async () => {
          render(<App />);
          const inputElement = screen.getByRole('textbox', { name: /new task input/i });
          const addButton = screen.getByRole('button', { name: /add task/i });

          fireEvent.change(inputElement, { target: { value: 'Test todo' } });
          fireEvent.click(addButton);
          fireEvent.change(inputElement, { target: { value: 'Another todo' } });
          fireEvent.click(addButton);

          let sortDropdown;
          await waitFor(() => {
              sortDropdown = screen.getByLabelText(/Sort tasks/i);
              expect(sortDropdown).toBeInTheDocument();
          });

          fireEvent.change(sortDropdown, { target: { value: 'alphabetical' } });

           await waitFor(() => {
                expect(screen.getByDisplayValue('alphabetical')).toBeInTheDocument();
           });



      });
});
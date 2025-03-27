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



describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('todo-app')).toBeInTheDocument();
  });

  it('displays no todos message when there are no todos', () => {
    render(<App />);
    expect(screen.getByText('No todos yet! Add some.')).toBeInTheDocument();
  });

  it('adds a new todo', async () => {
    render(<App />);

    const inputElement = screen.getByPlaceholderText('Enter todo...');
    const prioritySelect = screen.getByRole('combobox', {name: /priority/i});
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Buy groceries' } });
    fireEvent.change(prioritySelect, { target: { value: 'high' } });

    fireEvent.click(addButton);

    await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });
  });

  it('toggles a todo as completed', async () => {
    render(<App />);

    const inputElement = screen.getByPlaceholderText('Enter todo...');
    const prioritySelect = screen.getByRole('combobox', {name: /priority/i});
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Walk the dog' } });
    fireEvent.change(prioritySelect, { target: { value: 'medium' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const todoText = screen.getByText('Walk the dog');
      const checkbox = todoText.closest('div')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (checkbox) {
        fireEvent.click(checkbox);
        expect(checkbox.checked).toBe(true);
      }
    });
  });

  it('deletes a todo', async () => {
      render(<App />);
  
      const inputElement = screen.getByPlaceholderText('Enter todo...');
      const prioritySelect = screen.getByRole('combobox', {name: /priority/i});
      const addButton = screen.getByRole('button', { name: /^Add$/i });
  
      fireEvent.change(inputElement, { target: { value: 'Pay bills' } });
      fireEvent.change(prioritySelect, { target: { value: 'low' } });
      fireEvent.click(addButton);
  
      await waitFor(() => {
          const todoText = screen.getByText('Pay bills');
          const deleteButton = todoText.closest('div')?.querySelector('button[aria-label="Delete Todo"]') as HTMLButtonElement;
  
          if (deleteButton) {
              fireEvent.click(deleteButton);
              expect(() => screen.getByText('Pay bills')).toThrow();
          }
      });
  });

  it('filters todos correctly', async () => {
    render(<App />);

    const inputElement = screen.getByPlaceholderText('Enter todo...');
    const prioritySelect = screen.getByRole('combobox', {name: /priority/i});
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Active todo' } });
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    fireEvent.click(addButton);

    fireEvent.change(inputElement, { target: { value: 'Completed todo' } });
    fireEvent.change(prioritySelect, { target: { value: 'medium' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const todoText = screen.getByText('Completed todo');
      const checkbox = todoText.closest('div')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (checkbox) {
            fireEvent.click(checkbox);
        }
    });


    const filterSelect = screen.getByRole('combobox', { name: /filter/i });
    fireEvent.change(filterSelect, { target: { value: 'active' } });

    expect(screen.getByText('Active todo')).toBeInTheDocument();
    expect(() => screen.getByText('Completed todo')).toThrow();
  });


  it('updates a todo', async () => {
    render(<App />);

    const inputElement = screen.getByPlaceholderText('Enter todo...');
    const prioritySelect = screen.getByRole('combobox', {name: /priority/i});
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Original todo' } });
    fireEvent.change(prioritySelect, { target: { value: 'low' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const todoText = screen.getByText('Original todo');
      const editButton = todoText.closest('div')?.querySelector('button[aria-label="Edit Todo"]') as HTMLButtonElement;

        if (editButton) {
            fireEvent.click(editButton);

            const editInput = screen.getByDisplayValue('Original todo') as HTMLInputElement;
            fireEvent.change(editInput, { target: { value: 'Updated todo' } });

            const saveButton = screen.getByRole('button', { name: /^Save$/i });
            fireEvent.click(saveButton);

            expect(screen.getByText('Updated todo')).toBeInTheDocument();
            expect(() => screen.getByText('Original todo')).toThrow();
        }
    });
  });
});
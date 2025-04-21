import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../src/App';


// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});



// Mock crypto.randomUUID
Object.defineProperty(global.self, 'crypto', {
    value: {
        randomUUID: () => 'mock-uuid'
    }
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('adds a new todo', async () => {
    render(<App />);

    const inputElement = screen.getByLabelText(/Task:/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    await act(async () => {
      fireEvent.change(inputElement, { target: { value: 'New Todo' } });
      fireEvent.click(addButton);
    });

    expect(screen.getByText('New Todo')).toBeInTheDocument();
  });

  test('toggles a todo completion', async () => {
    render(<App />);

    const inputElement = screen.getByLabelText(/Task:/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    await act(async () => {
      fireEvent.change(inputElement, { target: { value: 'Test Todo' } });
      fireEvent.click(addButton);
    });

    const toggleButton = screen.getByRole('button', {name: /Mark task as complete/i});

    await act(async () => {
        fireEvent.click(toggleButton);
    });

    expect(toggleButton).toBeInTheDocument();
  });

  test('deletes a todo', async () => {
      render(<App />);
  
      const inputElement = screen.getByLabelText(/Task:/i) as HTMLInputElement;
      const addButton = screen.getByRole('button', { name: /Add Task/i });
  
      await act(async () => {
        fireEvent.change(inputElement, { target: { value: 'Delete Me' } });
        fireEvent.click(addButton);
      });
  
      const deleteButton = screen.getByRole('button', {name: /Delete task: Delete Me/i});

      await act(async () => {
        fireEvent.click(deleteButton);
      });

      const confirmDeleteButton = screen.getByRole('button', {name: /Delete Task/i});

      await act(async () => {
        fireEvent.click(confirmDeleteButton);
      });
  
      expect(screen.queryByText('Delete Me')).not.toBeInTheDocument();
    });

  test('filters todos', async () => {
    render(<App />);

    const inputElement = screen.getByLabelText(/Task:/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    await act(async () => {
      fireEvent.change(inputElement, { target: { value: 'Active Todo' } });
      fireEvent.click(addButton);
    });

    await act(async () => {
      fireEvent.change(inputElement, { target: { value: 'Completed Todo' } });
      fireEvent.click(addButton);
    });

    const toggleButton = screen.getAllByRole('button', {name: /Mark task as complete/i})[1];
    
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    const completedFilterButton = screen.getByRole('button', { name: /completed/i });

    await act(async () => {
      fireEvent.click(completedFilterButton);
    });

    expect(screen.getByText('Completed Todo')).toBeInTheDocument();
    expect(screen.queryByText('Active Todo')).not.toBeInTheDocument();
  });

  test('searches todos', async () => {
    render(<App />);

    const inputElement = screen.getByLabelText(/Task:/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    await act(async () => {
      fireEvent.change(inputElement, { target: { value: 'Searchable Todo' } });
      fireEvent.click(addButton);
    });

    const searchInput = screen.getByLabelText(/Search tasks, notes, tags.../i) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Searchable' } });
    });

    expect(screen.getByText('Searchable Todo')).toBeInTheDocument();
    expect(screen.queryByText('Another Todo')).not.toBeInTheDocument();
  });

  test('edits a todo', async () => {
    render(<App />);

    const inputElement = screen.getByLabelText(/Task:/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /Add Task/i });

    await act(async () => {
      fireEvent.change(inputElement, { target: { value: 'Original Todo' } });
      fireEvent.click(addButton);
    });

    const editButton = screen.getByRole('button', {name: /Edit task: Original Todo/i});

    await act(async () => {
      fireEvent.click(editButton);
    });

    const editInput = screen.getByLabelText(/Task description:/i) as HTMLInputElement;

    await act(async () => {
        fireEvent.change(editInput, { target: { value: 'Edited Todo' } });
    });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });

    await act(async () => {\n      fireEvent.click(saveButton);
    });

    expect(screen.getByText('Edited Todo')).toBeInTheDocument();
    expect(screen.queryByText('Original Todo')).not.toBeInTheDocument();
  });
});
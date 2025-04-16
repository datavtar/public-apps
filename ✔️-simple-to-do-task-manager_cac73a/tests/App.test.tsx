import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
  });

  it('adds a todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new todo text/i });
    const addButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(inputElement, { target: { value: 'Test Todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });
  });

  it('toggles a todo as complete', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new todo text/i });
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.change(inputElement, { target: { value: 'Another Todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const toggleButton = screen.getByRole('button', { name: /mark Another Todo as complete/i });
      fireEvent.click(toggleButton);

      expect(screen.getByText('Another Todo')).toHaveClass('line-through');
    });
  });

  it('deletes a todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new todo text/i });
    const addButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(inputElement, { target: { value: 'Todo to Delete' } });
    fireEvent.click(addButton);

    await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete Todo to Delete/i });
        fireEvent.click(deleteButton);

        expect(() => screen.getByText('Todo to Delete')).toThrow();
    });
  });

  it('edits a todo', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /new todo text/i });
    const addButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(inputElement, { target: { value: 'Todo to Edit' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit Todo to Edit/i });
      fireEvent.click(editButton);

      const editInput = screen.getByRole('textbox', { name: /edit todo text/i });
      fireEvent.change(editInput, { target: { value: 'Edited Todo' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      expect(screen.getByText('Edited Todo')).toBeInTheDocument();
    });
  });

  it('filters todos', async () => {
    render(<App />);

    const inputElement1 = screen.getByRole('textbox', { name: /new todo text/i });
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.change(inputElement1, { target: { value: 'Active Todo' } });
    fireEvent.click(addButton);

    const inputElement2 = screen.getByRole('textbox', { name: /new todo text/i });
    fireEvent.change(inputElement2, { target: { value: 'Completed Todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const toggleButton = screen.getByRole('button', { name: /mark Completed Todo as complete/i });
      fireEvent.click(toggleButton);
    });

    const filterSelect = screen.getByRole('combobox', { name: /filter todos by status/i });

    fireEvent.change(filterSelect, { target: { value: 'active' } });

    await waitFor(() => {
      expect(screen.getByText('Active Todo')).toBeInTheDocument();
      expect(() => screen.getByText('Completed Todo')).toThrow();
    });
  });

  it('sorts todos', async () => {
    render(<App />);

    const inputElement1 = screen.getByRole('textbox', { name: /new todo text/i });
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.change(inputElement1, { target: { value: 'B Todo' } });
    fireEvent.click(addButton);

    const inputElement2 = screen.getByRole('textbox', { name: /new todo text/i });
    fireEvent.change(inputElement2, { target: { value: 'A Todo' } });
    fireEvent.click(addButton);

    const sortSelect = screen.getByRole('combobox', { name: /sort todos/i });
    fireEvent.change(sortSelect, { target: { value: 'alphabetical' } });

    await waitFor(() => {
      const todoItems = screen.getAllByRole('listitem');
      expect(todoItems[0]).toHaveTextContent('A Todo');
      expect(todoItems[1]).toHaveTextContent('B Todo');
    });
  });

   it('searches todos', async () => {
    render(<App />);

    const inputElement1 = screen.getByRole('textbox', { name: /new todo text/i });
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.change(inputElement1, { target: { value: 'Find Me' } });
    fireEvent.click(addButton);

       const inputElement2 = screen.getByRole('textbox', { name: /new todo text/i });
       fireEvent.change(inputElement2, { target: { value: 'Do Not Find' } });
       fireEvent.click(addButton);

    const searchInput = screen.getByRole('textbox', { name: /search todos/i });
    fireEvent.change(searchInput, { target: { value: 'Find' } });

    await waitFor(() => {
      expect(screen.getByText('Find Me')).toBeInTheDocument();
      expect(() => screen.getByText('Do Not Find')).toThrow();
    });
  });

  it('toggles dark mode', () => {
    render(<App />);
    const themeToggleButton = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(themeToggleButton);
    expect(localStorageMock.getItem('darkMode')).toBe('true');

    const themeToggleButtonLight = screen.getByRole('button', { name: /switch to light mode/i });
    fireEvent.click(themeToggleButtonLight);
    expect(localStorageMock.getItem('darkMode')).toBe('false');
  });
});
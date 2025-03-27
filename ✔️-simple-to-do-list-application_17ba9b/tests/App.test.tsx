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

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Minimal To-Do/i)).toBeInTheDocument();
  });

  test('adds a todo', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText('New todo input') as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Buy groceries' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });
  });

  test('toggles a todo completion status', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText('New todo input') as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Walk the dog' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', {name: /Walk the dog/i}) as HTMLInputElement
      fireEvent.click(checkbox);

      expect(checkbox.checked).toBe(true);
    });
  });

  test('deletes a todo', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText('New todo input') as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Pay bills' } });
    fireEvent.click(addButton);

    let deleteButton;

    await waitFor(() => {
       deleteButton = screen.getByRole('button', {name: /Delete todo: Pay bills/i})
       fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('Pay bills')).toBeNull();
    });
  });

  test('edits a todo', async () => {
    render(<App />);
    const inputElement = screen.getByLabelText('New todo input') as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Read a book' } });
    fireEvent.click(addButton);

    let editButton;
    await waitFor(() => {
      editButton = screen.getByRole('button', { name: /Edit todo: Read a book/i });
      fireEvent.click(editButton);
    });

    const editInputElement = screen.getByLabelText('Edit todo input') as HTMLInputElement;
    fireEvent.change(editInputElement, { target: { value: 'Read 2 books' } });
    const saveButton = screen.getByRole('button', { name: /Save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Read 2 books')).toBeInTheDocument();
      expect(screen.queryByText('Read a book')).toBeNull();
    });
  });

  test('filters todos', async () => {
    render(<App />);
    const inputElement1 = screen.getByLabelText('New todo input') as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement1, { target: { value: 'Task 1' } });
    fireEvent.click(addButton);

    const inputElement2 = screen.getByLabelText('New todo input') as HTMLInputElement;
    fireEvent.change(inputElement2, { target: { value: 'Task 2' } });
    fireEvent.click(addButton);


    await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', {name: /Task 1/i}) as HTMLInputElement
        fireEvent.click(checkbox)
    })
    const filterSelect = screen.getByLabelText('Filter todos') as HTMLSelectElement;

    fireEvent.change(filterSelect, { target: { value: 'completed' } });

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.queryByText('Task 2')).toBeNull();
    });

    fireEvent.change(filterSelect, { target: { value: 'active' } });

    await waitFor(() => {
        expect(screen.queryByText('Task 1')).toBeNull();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

    fireEvent.change(filterSelect, { target: { value: 'all' } });

    await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

  });

  test('sorts todos', async () => {
    render(<App />);
    const inputElement1 = screen.getByLabelText('New todo input') as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement1, { target: { value: 'Task B' } });
    fireEvent.click(addButton);

    const inputElement2 = screen.getByLabelText('New todo input') as HTMLInputElement;
    fireEvent.change(inputElement2, { target: { value: 'Task A' } });
    fireEvent.click(addButton);

    const sortSelect = screen.getByLabelText('Sort todos') as HTMLSelectElement;

    fireEvent.change(sortSelect, { target: { value: 'alpha-asc' } });

    await waitFor(() => {
      const todoElements = screen.getAllByRole('listitem');
      expect(todoElements[0]).toHaveTextContent('Task A');
      expect(todoElements[1]).toHaveTextContent('Task B');
    });

    fireEvent.change(sortSelect, { target: { value: 'alpha-desc' } });

    await waitFor(() => {
      const todoElements = screen.getAllByRole('listitem');
      expect(todoElements[0]).toHaveTextContent('Task B');
      expect(todoElements[1]).toHaveTextContent('Task A');
    });
  });

    test('searches todos', async () => {
        render(<App />);
        const inputElement1 = screen.getByLabelText('New todo input') as HTMLInputElement;
        const addButton = screen.getByRole('button', { name: /^Add$/i });

        fireEvent.change(inputElement1, { target: { value: 'Task One' } });
        fireEvent.click(addButton);

        const inputElement2 = screen.getByLabelText('New todo input') as HTMLInputElement;
        fireEvent.change(inputElement2, { target: { value: 'Task Two' } });
        fireEvent.click(addButton);

        const searchInput = screen.getByLabelText('Search todos') as HTMLInputElement;

        fireEvent.change(searchInput, { target: { value: 'One' } });

        await waitFor(() => {
            expect(screen.getByText('Task One')).toBeInTheDocument();
            expect(screen.queryByText('Task Two')).toBeNull();
        });

        fireEvent.change(searchInput, { target: { value: '' } });

        await waitFor(() => {
            expect(screen.getByText('Task One')).toBeInTheDocument();
            expect(screen.getByText('Task Two')).toBeInTheDocument();
        });
    });

    test('toggles dark mode', async () => {
      render(<App />);
      const themeToggle = screen.getByRole('switch', {name: /Switch to light mode/i});

      fireEvent.click(themeToggle);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.getItem('darkMode')).toBe('true');
      });

      const themeToggleLight = screen.getByRole('switch', {name: /Switch to dark mode/i});
      fireEvent.click(themeToggleLight);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorage.getItem('darkMode')).toBe('false');
      });
    });


});
import '@testing-library/jest-dom'
import * as React from 'react'
import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import App from '../src/App'


// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
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


beforeEach(() => {
  localStorageMock.clear();
});


test('renders the app', () => {
  render(<App />);
  expect(screen.getByText('Minimalist To-Do')).toBeInTheDocument();
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

test('toggles a todo completion', async () => {
    render(<App />);
  
    const inputElement = screen.getByLabelText('New todo input') as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add$/i });
  
    fireEvent.change(inputElement, { target: { value: 'Walk the dog' } });
    fireEvent.click(addButton);

    await waitFor(() => {
        const toggleButton = screen.getByRole('checkbox', {name: /^Mark todo Walk the dog/i})
        fireEvent.click(toggleButton)
        expect(toggleButton).toHaveAttribute('aria-checked', 'true')
    })
    
  });

test('deletes a todo', async () => {
  render(<App />);

  const inputElement = screen.getByLabelText('New todo input') as HTMLInputElement;
  const addButton = screen.getByRole('button', { name: /^Add$/i });

  fireEvent.change(inputElement, { target: { value: 'Pay bills' } });
  fireEvent.click(addButton);

  await waitFor(() => {
      const deleteButton = screen.getByRole('button', {name: /^Delete todo Pay bills/i});
      fireEvent.click(deleteButton);
      expect(() => screen.getByText('Pay bills')).toThrow();
  })
});

test('edits a todo', async () => {
    render(<App />);
  
    const inputElement = screen.getByLabelText('New todo input') as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add$/i });
  
    fireEvent.change(inputElement, { target: { value: 'Mow lawn' } });
    fireEvent.click(addButton);
  
    await waitFor(() => {
        const editButton = screen.getByRole('button', {name: /^Edit todo Mow lawn/i});
        fireEvent.click(editButton)

        const editInput = screen.getByRole('textbox', {name: /^Edit todo text for Mow lawn/i}) as HTMLInputElement
        fireEvent.change(editInput, {target: {value: 'Trim lawn'}})

        const saveButton = screen.getByRole('button', {name: /^Save changes for todo Trim lawn/i})
        fireEvent.click(saveButton)

        expect(screen.getByText('Trim lawn')).toBeInTheDocument()
    })
});

test('filters todos', async () => {
  render(<App />);

  const inputElement = screen.getByLabelText('New todo input') as HTMLInputElement;
  const addButton = screen.getByRole('button', { name: /^Add$/i });

  fireEvent.change(inputElement, { target: { value: 'Learn React' } });
  fireEvent.click(addButton);
  fireEvent.change(inputElement, { target: { value: 'Learn Testing' } });
  fireEvent.click(addButton);

  await waitFor(() => {
    const completeButton = screen.getByRole('checkbox', {name: /^Mark todo Learn React/i});
    fireEvent.click(completeButton)
  })

  fireEvent.click(screen.getByRole('button', {name: 'completed'}))

  await waitFor(() => {
    expect(screen.getByText('Learn React')).toBeInTheDocument()
    expect(() => screen.getByText('Learn Testing')).toThrow()
  })
});

test('searches todos', async () => {
  render(<App />);

  const inputElement = screen.getByLabelText('New todo input') as HTMLInputElement;
  const addButton = screen.getByRole('button', { name: /^Add$/i });

  fireEvent.change(inputElement, { target: { value: 'Buy milk' } });
  fireEvent.click(addButton);
  fireEvent.change(inputElement, { target: { value: 'Buy eggs' } });
  fireEvent.click(addButton);

  const searchInput = screen.getByLabelText('Search todos') as HTMLInputElement
  fireEvent.change(searchInput, {target: {value: 'milk'}})

  await waitFor(() => {
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
    expect(() => screen.getByText('Buy eggs')).toThrow()
  })
});

test('toggles dark mode', async () => {
    render(<App />);
  
    const themeToggleButton = screen.getByRole('button', { name: /^Switch to dark mode/i });
    fireEvent.click(themeToggleButton);

    expect(localStorageMock.getItem('minimalistTodoTheme')).toBe('dark');

    const themeToggleButtonLight = screen.getByRole('button', { name: /^Switch to light mode/i });
    fireEvent.click(themeToggleButtonLight);
    expect(localStorageMock.getItem('minimalistTodoTheme')).toBe('light');
});
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


// Mock crypto.randomUUID
global.crypto = {
  // @ts-ignore
  randomUUID: () => 'mock-uuid',
};


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
  });

  it('initially shows loading state', () => {
    render(<App />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('renders the component after loading', async () => {
    render(<App />);
    // Wait for the loading state to disappear (adjust timeout if needed)
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText(/Simple To-Do/i)).toBeInTheDocument();
  });

  it('adds a new todo', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    }, { timeout: 2000 });

    const inputElement = screen.getByLabelText(/New todo text/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add Todo$/i });

    fireEvent.change(inputElement, { target: { value: 'Test todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
        expect(screen.getByText('Test todo')).toBeInTheDocument();
    });
  });

  it('toggles a todo as completed', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    }, { timeout: 2000 });

    const inputElement = screen.getByLabelText(/New todo text/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add Todo$/i });

    fireEvent.change(inputElement, { target: { value: 'Test todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Test todo')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox.checked).toBe(true);
    });
  });

  it('deletes a todo', async () => {
    render(<App />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    }, { timeout: 2000 });

    const inputElement = screen.getByLabelText(/New todo text/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add Todo$/i });

    fireEvent.change(inputElement, { target: { value: 'Test todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
        expect(screen.getByText('Test todo')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /^Delete todo: Test todo$/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Test todo')).not.toBeInTheDocument();
    });
  });

    it('edits a todo', async () => {
        render(<App />);

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
        }, { timeout: 2000 });

        const inputElement = screen.getByLabelText(/New todo text/i) as HTMLInputElement;
        const addButton = screen.getByRole('button', { name: /^Add Todo$/i });

        fireEvent.change(inputElement, { target: { value: 'Test todo' } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Test todo')).toBeInTheDocument();
        });

        const editButton = screen.getByRole('button', { name: /^Edit todo: Test todo$/i });
        fireEvent.click(editButton);

        const editInput = screen.getByLabelText(/Edit todo text/i) as HTMLInputElement;
        fireEvent.change(editInput, { target: { value: 'Updated todo' } });

        const saveButton = screen.getByRole('button', { name: /^Save$/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.queryByText('Test todo')).not.toBeInTheDocument();
            expect(screen.getByText('Updated todo')).toBeInTheDocument();
        });
    });

  it('filters todos correctly', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    }, { timeout: 2000 });

    const inputElement1 = screen.getByLabelText(/New todo text/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add Todo$/i });

    fireEvent.change(inputElement1, { target: { value: 'Active todo' } });
    fireEvent.click(addButton);

    const inputElement2 = screen.getByLabelText(/New todo text/i) as HTMLInputElement;
    fireEvent.change(inputElement2, { target: { value: 'Completed todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
        expect(screen.getByText('Active todo')).toBeInTheDocument();
        expect(screen.getByText('Completed todo')).toBeInTheDocument();
    });

    const checkbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement;
    fireEvent.click(checkbox);

    const completedFilterButton = screen.getByRole('button', { name: /completed/i });
    fireEvent.click(completedFilterButton);

    await waitFor(() => {
      expect(screen.getByText('Completed todo')).toBeInTheDocument();
      expect(screen.queryByText('Active todo')).not.toBeInTheDocument();
    });
  });

 it('sorts todos by text', async () => {
    render(<App />);

     // Wait for loading to finish
     await waitFor(() => {
        expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
     }, { timeout: 2000 });

    const inputElement1 = screen.getByLabelText(/New todo text/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add Todo$/i });

    fireEvent.change(inputElement1, { target: { value: 'B todo' } });
    fireEvent.click(addButton);

    const inputElement2 = screen.getByLabelText(/New todo text/i) as HTMLInputElement;
    fireEvent.change(inputElement2, { target: { value: 'A todo' } });
    fireEvent.click(addButton);

     await waitFor(() => {
        expect(screen.getByText('B todo')).toBeInTheDocument();
        expect(screen.getByText('A todo')).toBeInTheDocument();
     });

    const sortByTextButton = screen.getByRole('button', { name: /Text/i });
    fireEvent.click(sortByTextButton);

    await waitFor(() => {
        const todoElements = screen.getAllByText(/todo/i);
        expect(todoElements[0]).toHaveTextContent('A todo');
        expect(todoElements[1]).toHaveTextContent('B todo');
    });
 });
});
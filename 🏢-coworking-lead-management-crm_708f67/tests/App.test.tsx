import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock local storage
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
Object.defineProperty(global.self, 'crypto', {
    value: {
        randomUUID: () => 'test-uuid'
    }
});



describe('App Component', () => {
  beforeEach(() => {
    // Clear local storage before each test
    localStorageMock.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Coworking CRM/i)).toBeInTheDocument();
  });

  test('displays total leads count', () => {
    render(<App />);
    expect(screen.getByText(/Total Leads/i)).toBeInTheDocument();
  });

  test('opens and closes the modal', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /^Add Lead$/i });
    fireEvent.click(addButton);

    await waitFor(() => {
        expect(screen.getByText(/Add New Lead/i)).toBeInTheDocument();
    });

    const closeModalButton = screen.getByRole('button', { name: /^Close modal$/i });
    fireEvent.click(closeModalButton);

    await waitFor(() => {
      expect(screen.queryByText(/Add New Lead/i)).not.toBeInTheDocument();
    });
  });

  test('adds a new lead', async () => {
    render(<App />);

    // Open the modal
    const addButton = screen.getByRole('button', { name: /^Add Lead$/i });
    fireEvent.click(addButton);

    await waitFor(() => {
        expect(screen.getByText(/Add New Lead/i)).toBeInTheDocument();
    });

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '123-456-7890' } });

    // Submit the form
    const saveButton = screen.getByRole('button', { name: /^Add Lead$/i });
    fireEvent.click(saveButton);

    // Wait for the modal to close and the lead to be added
    await waitFor(() => {
      expect(screen.queryByText(/Add New Lead/i)).not.toBeInTheDocument();
    });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

    test('displays no leads message when there are no leads', () => {
        localStorageMock.setItem('coworkingLeads', JSON.stringify([]));

        render(<App />);

        expect(screen.getByText(/No leads found matching your criteria./i)).toBeInTheDocument();
    });

  test('filters leads by search term', async () => {
    // Arrange
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Search by name, email, phone.../i);

    // Act
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Alice Wonderland/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Bob The Builder/i)).not.toBeInTheDocument();
  });

  test('toggles dark mode', async () => {
    render(<App />);
    const themeToggleButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(themeToggleButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    const themeToggleButtonLight = screen.getByRole('button', { name: /Switch to light mode/i });
    fireEvent.click(themeToggleButtonLight);

    await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

  });

  test('handle clear filters and search', async () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/Search by name, email, phone.../i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    const clearButton = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
        expect(searchInput.value).toBe("");
    });
});
});

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

// Mock window.confirm
global.confirm = jest.fn(() => true);


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Student Progress Tracker')).toBeInTheDocument();
  });

  it('navigates to the Students tab', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Students'));
    expect(screen.getByText('Students')).toHaveClass('border-primary-500');
  });

  it('adds a new student', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Students'));
    fireEvent.click(screen.getByRole('button', { name: /^Add Student$/i }));

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john.doe@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /^Add Student$/i }));

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('deletes a student', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Students'));
    fireEvent.click(screen.getByRole('button', { name: /^Add Student$/i }));

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john.doe@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /^Add Student$/i }));

    await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Now delete the student
    const deleteButton = screen.getByRole('button', { name: /Delete student/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  it('exports and imports data', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Students'));

    const templateButton = screen.getByRole('button', { name: /Template/i });
    expect(templateButton).toBeInTheDocument();

    const exportButton = screen.getByRole('button', { name: /Export/i });
    expect(exportButton).toBeInTheDocument();
  });
});

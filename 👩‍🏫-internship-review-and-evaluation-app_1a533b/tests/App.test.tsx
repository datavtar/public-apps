import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = String(value);
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

beforeEach(() => {
  localStorageMock.clear();
  // Set initial localStorage data to avoid undefined
  localStorageMock.setItem('students', JSON.stringify([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@university.edu',
      course: 'Computer Science',
      company: 'Tech Solutions Inc.',
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      status: 'completed',
    },
  ]));
  localStorageMock.setItem('evaluations', JSON.stringify([]));
  localStorageMock.setItem('templates', JSON.stringify([]));
});

test('renders the component', async () => {
  render(<App />);

  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  // Check if the header is rendered
  expect(screen.getByText('Internship Evaluation System')).toBeInTheDocument();
});

test('shows loading state initially', () => {
  render(<App />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

test('renders students tab by default', async () => {
  render(<App />);

    await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

  expect(screen.getByText('Students')).toBeInTheDocument();
});

test('adds a new student', async () => {
    render(<App />);

    await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jane.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/Course/i), { target: { value: 'Engineering' } });
    fireEvent.change(screen.getByLabelText(/Company/i), { target: { value: 'Acme Corp' } });
    fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2024-06-01' } });
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'active' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
});

test('deletes a student', async () => {
    render(<App />);

    await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /Delete student/i });
    fireEvent.click(deleteButton);

    // Mock window.confirm
    const confirmMock = jest.spyOn(window, 'confirm');
    confirmMock.mockImplementation(() => true);

    fireEvent.click(deleteButton);

    confirmMock.mockRestore();
});

test('navigates to evaluations tab', async () => {
    render(<App />);

    await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Evaluations'));

    expect(screen.getByText('All Evaluations')).toBeInTheDocument();
});
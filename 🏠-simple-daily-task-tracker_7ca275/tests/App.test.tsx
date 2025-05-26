import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

// Mock date-fns format function to have consistent date
jest.mock('date-fns/format', () => ({
  __esModule: true,
  format: jest.fn().mockReturnValue('2024-01-01'),
}));

// Mock date-fns functions used for weekly summary calculations to return consistent dates
jest.mock('date-fns', () => {
  const originalModule = jest.requireActual('date-fns');
  return {
    __esModule: true,
    ...originalModule,
    startOfWeek: jest.fn().mockReturnValue(new Date('2023-12-31')),
    endOfWeek: jest.fn().mockReturnValue(new Date('2024-01-06')),
    isToday: jest.fn().mockReturnValue(true), // Mock isToday to always return true for simplicity
    addDays: jest.fn((date: Date, days: number) => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + days);
      return newDate;
    }),
    subDays: jest.fn((date: Date, days: number) => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() - days);
      return newDate;
    }),
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('adds a task', () => {
    render(<App />);
    const inputElement = screen.getByPlaceholderText(/^Add a task for today...$/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Buy groceries' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });

  test('toggles a task', () => {
    render(<App />);
    const inputElement = screen.getByPlaceholderText(/^Add a task for today...$/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Walk the dog' } });
    fireEvent.click(addButton);

    const toggleButton = screen.getByRole('button', { name: /check/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText('Walk the dog')).toHaveClass('line-through');
  });

  test('deletes a task', () => {
    render(<App />);
    const inputElement = screen.getByPlaceholderText(/^Add a task for today...$/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Pay bills' } });
    fireEvent.click(addButton);

    const deleteButton = screen.getByRole('button', { name: /trash2/i });
    fireEvent.click(deleteButton);

    expect(screen.queryByText('Pay bills')).toBeNull();
  });

  test('edits a task', async () => {
    render(<App />);
    const inputElement = screen.getByPlaceholderText(/^Add a task for today...$/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Grocery' } });
    fireEvent.click(addButton);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    const editInputElement = screen.getByDisplayValue('Grocery') as HTMLInputElement;
    fireEvent.change(editInputElement, { target: { value: 'Groceries' } });
    fireEvent.blur(editInputElement);  // Simulate blur to save edit

    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  test('switches tabs and displays correct tasks', async () => {
    render(<App />);
    const inputElement = screen.getByPlaceholderText(/^Add a task for today...$/i) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: /^Add$/i });

    fireEvent.change(inputElement, { target: { value: 'Task today' } });
    fireEvent.click(addButton);

    const tomorrowTabButton = screen.getByText('Tomorrow');
    fireEvent.click(tomorrowTabButton);

    const tomorrowInputElement = screen.getByPlaceholderText(/^Add a task for tomorrow...$/i) as HTMLInputElement;
    fireEvent.change(tomorrowInputElement, { target: { value: 'Task tomorrow' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Task tomorrow')).toBeInTheDocument();

    const todayTabButton = screen.getByText('Today');
    fireEvent.click(todayTabButton);

    expect(screen.getByText('Task today')).toBeInTheDocument();
    expect(screen.queryByText('Task tomorrow')).toBeNull();
  });

 test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Toggle dark mode/i });
    fireEvent.click(darkModeButton);

    expect(localStorageMock.getItem('darkMode')).toBe('true');
  });

  test('displays no tasks message when there are no tasks', () => {
    render(<App />);
    expect(screen.getByText(/No tasks for today/i)).toBeInTheDocument();
  });

  test('opens and closes weekly summary modal', () => {
    render(<App />);
    const weeklySummaryButton = screen.getByRole('button', { name: /Weekly/i });
    fireEvent.click(weeklySummaryButton);
    expect(screen.getByText(/Weekly Summaries/i)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText(/Weekly Summaries/i)).toBeNull();
  });
});
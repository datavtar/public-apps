import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    clear() {
      store = {};
    },
    removeItem(key: string) {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the app', () => {
    render(<App />);
    expect(screen.getByText('Student Progress Tracker')).toBeInTheDocument();
  });

  test('renders the Dashboard tab by default', () => {
    render(<App />);
    expect(screen.getByText('Total Students')).toBeInTheDocument();
  });

  test('navigates to the Students tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Students'));
    expect(screen.getByText('Add Student')).toBeInTheDocument();
  });

  test('navigates to the Assignments tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Assignments'));
    expect(screen.getByText('Add Assignment')).toBeInTheDocument();
  });

  test('navigates to the Analytics tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Analytics'));
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  test('adds a student', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Students'));
    fireEvent.click(screen.getByRole('button', { name: /^Add Student$/i }));

    fireEvent.change(screen.getByLabelText('Full Name *'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email Address *'), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText('Grade Level *'), { target: { value: '10th' } });

    fireEvent.click(screen.getByRole('button', { name: /^Add Student$/i }));
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('adds an assignment', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Assignments'));
    fireEvent.click(screen.getByRole('button', { name: /^Add Assignment$/i }));

    fireEvent.change(screen.getByLabelText('Assignment Title *'), { target: { value: 'Math Test' } });
    fireEvent.change(screen.getByLabelText('Subject *'), { target: { value: 'Mathematics' } });
    fireEvent.change(screen.getByLabelText('Total Marks *'), { target: { value: '100' } });

    fireEvent.click(screen.getByRole('button', { name: /^Create Assignment$/i }));
    expect(screen.getByText('Math Test')).toBeInTheDocument();
  });

  test('opens and closes student modal', async () => {
      render(<App />);
      fireEvent.click(screen.getByText('Students'));
      fireEvent.click(screen.getByRole('button', { name: /^Add Student$/i }));
      expect(screen.getByText('Add New Student')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', {name: 'Cancel'}))
      
  });

});
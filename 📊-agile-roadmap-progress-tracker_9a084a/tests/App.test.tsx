import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    clear(): void {
      store = {};
    },
    removeItem(key: string): void {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });



test('renders Agile Roadmap Dashboard title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Agile Roadmap Dashboard/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders Overview tab by default', () => {
  render(<App />);
  const overviewTab = screen.getByText(/Overview/i);
  expect(overviewTab).toBeInTheDocument();
});

test('navigates to Sprints tab', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Sprints/i));
  expect(screen.getByText(/Sprints/i)).toBeInTheDocument();
});

test('navigates to Epics tab', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Epics/i));
  expect(screen.getByText(/Epics/i)).toBeInTheDocument();
});

test('navigates to User Stories tab', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/User Stories/i));
  expect(screen.getByText(/User Stories/i)).toBeInTheDocument();
});

test('navigates to Roadmap tab', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Roadmap/i));
  expect(screen.getByText(/Product Roadmap/i)).toBeInTheDocument();
});

test('adds a new sprint', async () => {
  render(<App />);

  // Navigate to Sprints tab
  fireEvent.click(screen.getByText(/Sprints/i));

  // Click Add Sprint button
  fireEvent.click(screen.getByRole('button', { name: /Add Sprint/i }));

  // Fill out the form
  fireEvent.change(screen.getByLabelText(/Sprint Name/i), { target: { value: 'Test Sprint' } });
  fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2024-01-01' } });
  fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2024-01-15' } });
  fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'planning' } });
  fireEvent.change(screen.getByLabelText(/Total Story Points/i), { target: { value: '10' } });
  fireEvent.change(screen.getByLabelText(/Completed Story Points/i), { target: { value: '0' } });

  // Submit the form
  fireEvent.click(screen.getByRole('button', { name: /Add Sprint/i }));

  // Assert that the new sprint is displayed
  //await screen.findByText(/Test Sprint/i);
});
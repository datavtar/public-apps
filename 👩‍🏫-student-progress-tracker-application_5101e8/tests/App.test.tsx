import '@testing-library/jest-dom'
import * as React from 'react'
import {render, screen} from '@testing-library/react'
import App from '../src/App'


describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading student data...')).toBeInTheDocument();
  });

  test('renders student list after loading', async () => {
    render(<App />);
    // Wait for loading to finish. Using findByText because the content is initially not there
    await screen.findByText('Student List', { exact: false });

    // Check if at least one student name is rendered
    const studentName = screen.getByText('Alice Wonderland', { exact: false })
    expect(studentName).toBeInTheDocument()

  });

  test('renders error message when loading fails', async () => {
    const localStorageMock = (() => {
      let store: {[key: string]: string} = {};

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

    Object.defineProperty(window, 'localStorage', {value: localStorageMock});

    localStorageMock.getItem = jest.fn(() => {
      throw new Error('Failed to load data from localStorage');
    });

    render(<App />);

    // Wait for the loading state to disappear and error message to appear
    await screen.findByText('Failed to load initial data. Using defaults.', {exact: false});
  });
});
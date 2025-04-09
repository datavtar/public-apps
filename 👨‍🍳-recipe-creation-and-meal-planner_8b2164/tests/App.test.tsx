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

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

beforeEach(() => {
  localStorage.clear();
});

describe('App Component', () => {
  it('renders the App component', () => {
    render(<App />);
    expect(screen.getByText(/Chef's Recipe Planner/i)).toBeInTheDocument();
  });

  it('displays recipes view by default', () => {
    render(<App />);
    expect(screen.getByText(/My Recipes/i)).toBeInTheDocument();
  });

  it('allows navigation to the meal planner view', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Meal Planner/i }));
    expect(screen.getByText(/Notes for the Day/i)).toBeInTheDocument();
  });

  it('allows navigation to the dashboard view', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText(/Recipe Dashboard/i)).toBeInTheDocument();
  });

 it('allows adding a new recipe', async () => {
    render(<App />);

    // Arrange: Click the "Add New Recipe" button
    fireEvent.click(screen.getByRole('button', { name: /Add New Recipe/i }));

    // Act: Fill out the recipe form
    fireEvent.change(screen.getByLabelText(/Recipe Name/i), { target: { value: 'Test Recipe' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/Ingredient name/i), { target: { value: 'Ingredient 1' } });
    fireEvent.change(screen.getByPlaceholderText(/Qty/i), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText(/Unit/i), { target: { value: 'g' } });
    fireEvent.change(screen.getByLabelText(/Instructions/i), { target: { value: 'Test Instructions' } });
    fireEvent.change(screen.getByLabelText(/Prep Time/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Cook Time/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Servings/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Test Category' } });

    // Act: Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Save Recipe/i }));
    
    await waitFor(() => {
         expect(screen.getByText(/Test Recipe/i)).toBeInTheDocument();
    })
  });
});
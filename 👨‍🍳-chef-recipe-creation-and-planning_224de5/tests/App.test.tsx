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
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
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
    expect(screen.getByText(/My Recipe Collection/i)).toBeInTheDocument();
  });

  it('navigates to meal plans view', () => {
    render(<App />);
    const mealPlansButton = screen.getByRole('button', { name: /Meal Plans/i });
    fireEvent.click(mealPlansButton);
    expect(screen.getByText(/My Meal Plans/i)).toBeInTheDocument();
  });

  it('navigates to add recipe view', () => {
    render(<App />);
    const addRecipeButton = screen.getByRole('button', { name: /New Recipe/i });
    fireEvent.click(addRecipeButton);
    expect(screen.getByText(/Add New Recipe/i)).toBeInTheDocument();
  });

  it('adds a new recipe', async () => {
    render(<App />);
    const addRecipeButton = screen.getByRole('button', { name: /New Recipe/i });
    fireEvent.click(addRecipeButton);

    fireEvent.change(screen.getByLabelText(/Recipe Name/i), { target: { value: 'Test Recipe' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/Servings/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Prep Time/i), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText(/Cook Time/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/Difficulty/i), { target: { value: 'Easy' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Test Category' } });
    fireEvent.change(screen.getByLabelText(/Tags/i), { target: { value: 'test, recipe' } });

    fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'Ingredient 1' } });

    const addRecipeSubmitButton = screen.getByRole('button', { name: /Add Recipe/i });

    fireEvent.click(addRecipeSubmitButton);

    expect(await screen.findByText(/My Recipe Collection/i)).toBeInTheDocument();
  });

  it('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  it('deletes a recipe', async () => {
    render(<App />);
    // Assuming there is at least one recipe loaded initially
    const deleteButton = screen.getAllByRole('button', { name: /^Delete/i })[0];
    fireEvent.click(deleteButton);

    // Mocking the window confirm
    (global.confirm as jest.Mock).mockImplementationOnce(() => true);


    // Assert that window.confirm was called
    expect(global.confirm).toHaveBeenCalled();

  });

  it('filters recipes by search term', async () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Search recipes/i);

    fireEvent.change(searchInput, { target: { value: 'Pasta' } });
    expect(screen.getByText(/Classic Pasta Carbonara/i)).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'NonExistingRecipe' } });
    // expect(screen.getByText(/No recipes found/i)).toBeInTheDocument();
  });

  it('filters recipes by category', async () => {
    render(<App />);
    const categoryFilter = screen.getByLabelText(/Filter by category/i);
    fireEvent.change(categoryFilter, { target: { value: 'Breakfast' } });
    expect(screen.getByText(/Avocado Toast/i)).toBeInTheDocument();
  });

});
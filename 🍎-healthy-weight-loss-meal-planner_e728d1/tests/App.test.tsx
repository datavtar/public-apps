import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';



describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Healthy Meal Planner/i)).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode|Switch to light mode/i });
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('mealPlannerDarkMode')).toBe('true');
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('mealPlannerDarkMode')).toBe('false');
  });

  test('navigates to meals view', () => {
    render(<App />);
    const mealsButton = screen.getByRole('button', { name: /Meals/i });
    fireEvent.click(mealsButton);
    expect(screen.getByPlaceholderText(/Search meals.../i)).toBeInTheDocument();
  });

  test('navigates to shopping view', () => {
    render(<App />);
    const shoppingButton = screen.getByRole('button', { name: /Shopping/i });
    fireEvent.click(shoppingButton);
    expect(screen.getByText(/Shopping List/i)).toBeInTheDocument();
  });

  test('navigates to stats view', () => {
    render(<App />);
    const statsButton = screen.getByRole('button', { name: /Stats/i });
    fireEvent.click(statsButton);
    expect(screen.getByText(/Nutrition Stats/i)).toBeInTheDocument();
  });

  test('adds a new meal', async () => {
    render(<App />);
    const mealsButton = screen.getByRole('button', { name: /Meals/i });
    fireEvent.click(mealsButton);

    const addMealButton = screen.getByRole('button', { name: /Add Meal/i });
    fireEvent.click(addMealButton);

    const mealNameInput = screen.getByLabelText(/Meal Name/i);
    const caloriesInput = screen.getByLabelText(/Calories/i);
    const ingredientsTextarea = screen.getByLabelText(/Ingredients/i);

    fireEvent.change(mealNameInput, { target: { value: 'Test Meal' } });
    fireEvent.change(caloriesInput, { target: { value: '300' } });
    fireEvent.change(ingredientsTextarea, { target: { value: 'Ingredient 1\nIngredient 2' } });

    const addMealSubmitButton = screen.getByRole('button', { name: /Add Meal/i });
    fireEvent.click(addMealSubmitButton);

    expect(await screen.findByText(/Test Meal/i)).toBeInTheDocument();
  });

 test('generates and regenerates shopping list', async () => {
    render(<App />);
    const calendarButton = screen.getByRole('button', { name: /Calendar/i });
    fireEvent.click(calendarButton);

    const generateShoppingListButton = screen.getByRole('button', { name: /Generate Shopping List/i });
    fireEvent.click(generateShoppingListButton);

    expect(screen.getByText(/Shopping List/i)).toBeInTheDocument();

    const regenerateShoppingListButton = screen.getByRole('button', { name: /Regenerate List/i });
    fireEvent.click(regenerateShoppingListButton);

    expect(screen.getByText(/Shopping List/i)).toBeInTheDocument();
  });
});
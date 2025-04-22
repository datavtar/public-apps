import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Healthy Meal Planner/i)).toBeInTheDocument();
  });

  test('renders Calendar view by default', () => {
    render(<App />);
    expect(screen.getByText(/Generate Shopping List/i)).toBeInTheDocument();
  });

  test('navigates to Meals view', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Meals/i));
    expect(screen.getByPlaceholderText(/Search meals.../i)).toBeInTheDocument();
  });

  test('navigates to Shopping view', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Shopping/i));
    expect(screen.getByText(/Shopping List/i)).toBeInTheDocument();
  });

  test('navigates to Stats view', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Stats/i));
    expect(screen.getByText(/Nutrition Stats/i)).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('mealPlannerDarkMode')).toBe('true');

    const lightModeButton = screen.getByRole('button', { name: /Switch to light mode/i });
    fireEvent.click(lightModeButton);
    expect(localStorage.getItem('mealPlannerDarkMode')).toBe('false');
  });

  test('opens and closes the Add Meal modal', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Meals/i));
    fireEvent.click(screen.getByRole('button', { name: /Add Meal/i }));
    expect(screen.getByText(/Add New Meal/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Close modal/i));
    expect(screen.queryByText(/Add New Meal/i)).not.toBeInTheDocument();
  });

  test('opens meal selector when clicking Add breakfast', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Add breakfast/i));
    expect(screen.getByText(/Select Breakfast/i)).toBeInTheDocument();
  });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
const originalConfirm = window.confirm;

beforeAll(() => {
  window.confirm = jest.fn(() => true); // Always return true for confirm
});

afterAll(() => {
  window.confirm = originalConfirm;
});

// Helper function to wait for element to be present
const waitForElement = (text: string) => {
  return screen.findByText(text);
};

describe('App Component', () => {

  beforeEach(() => {
    localStorageMock.clear();
    // Set up initial localStorage values if needed
    localStorageMock.setItem('chefRecipes', JSON.stringify([]));
    localStorageMock.setItem('chefMealPlans', JSON.stringify([]));
    localStorageMock.setItem('chefShoppingList', JSON.stringify([]));
    localStorageMock.setItem('chefDarkMode', JSON.stringify(false));
  });

  it('renders the app header', () => {
    render(<App />);
    const headerElement = screen.getByText(/Chef's Planner/i);
    expect(headerElement).toBeInTheDocument();
  });

  it('renders the Recipes tab by default', () => {
    render(<App />);
    const recipesTabHeader = screen.getByText(/My Recipes/i);
    expect(recipesTabHeader).toBeInTheDocument();
  });

  it('navigates to Meal Plans tab', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Meal Plans/i }));
    await waitFor(() => {
      expect(screen.getByText(/Meal Plans/i)).toBeInTheDocument();
    });
  });

  it('navigates to Shopping List tab', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Shopping List/i }));
    await waitFor(() => {
      expect(screen.getByText(/Shopping List/i)).toBeInTheDocument();
    });
  });

  it('allows adding a new recipe', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Add Recipe/i }));

    // Wait for the modal to open
    await waitFor(() => screen.getByLabelText(/Recipe Name/i));

    fireEvent.change(screen.getByLabelText(/Recipe Name/i), { target: { value: 'Test Recipe' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Recipe/i }));

    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });
  });

  it('allows deleting a recipe', async () => {
    render(<App />);

    // Add a recipe first to ensure there's something to delete
    fireEvent.click(screen.getByRole('button', { name: /Add Recipe/i }));
    await waitFor(() => screen.getByLabelText(/Recipe Name/i));
    fireEvent.change(screen.getByLabelText(/Recipe Name/i), { target: { value: 'ToDelete' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Recipe/i }));
    await waitFor(() => screen.getByText('ToDelete'));

    // Now delete it
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(screen.queryByText('ToDelete')).toBeNull();
    });
  });

 it('allows adding a new meal plan', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Meal Plans/i }));
    await waitFor(() => screen.getByText(/Create Plan/i));
    fireEvent.click(screen.getByRole('button', { name: /Create Plan/i }));

    // Wait for the modal to open
    await waitFor(() => screen.getByLabelText(/Plan Name/i));

    fireEvent.change(screen.getByLabelText(/Plan Name/i), { target: { value: 'Test MealPlan' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Meal Plan/i }));

    await waitFor(() => {
      expect(screen.getByText('Test MealPlan')).toBeInTheDocument();
    });
  });

  it('allows deleting a mealplan', async () => {
     render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Meal Plans/i }));
    await waitFor(() => screen.getByText(/Create Plan/i));
    fireEvent.click(screen.getByRole('button', { name: /Create Plan/i }));

    // Wait for the modal to open
    await waitFor(() => screen.getByLabelText(/Plan Name/i));

    fireEvent.change(screen.getByLabelText(/Plan Name/i), { target: { value: 'ToDeleteMealPlan' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Meal Plan/i }));

    await waitFor(() => {
      expect(screen.getByText('ToDeleteMealPlan')).toBeInTheDocument();
    });

    // Now delete it
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(screen.queryByText('ToDeleteMealPlan')).toBeNull();
    });

  });
});
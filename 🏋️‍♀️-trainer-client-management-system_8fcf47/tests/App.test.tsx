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
const originalConfirm = window.confirm;

beforeEach(() => {
  window.confirm = jest.fn(() => true); // Always return true for confirmation
  localStorage.clear();
});

afterEach(() => {
  window.confirm = originalConfirm;
});

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
  });

  it('renders the main heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/Fitness Trainer Dashboard/i);
    expect(headingElement).toBeInTheDocument();
  });

  it('initially displays the clients tab', () => {
    render(<App />);
    expect(screen.getByText(/Clients/i)).toBeInTheDocument();
  });

  it('adds a new client', () => {
    render(<App />);

    // Arrange
    const addClientButton = screen.getByRole('button', { name: /Add Client/i });

    // Act
    fireEvent.click(addClientButton);

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    const phoneInput = screen.getByLabelText(/Phone/i) as HTMLInputElement;
    const genderSelect = screen.getByLabelText(/Gender/i) as HTMLSelectElement;
    const ageInput = screen.getByLabelText(/Age/i) as HTMLInputElement;
    const heightInput = screen.getByLabelText(/Height \(cm\)/i) as HTMLInputElement;
    const startDateInput = screen.getByLabelText(/Start Date/i) as HTMLInputElement;
    const goalsTextarea = screen.getByLabelText(/Goals/i) as HTMLTextAreaElement;

    fireEvent.change(nameInput, { target: { value: 'Test Client' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '123-456-7890' } });
    fireEvent.change(genderSelect, { target: { value: 'male' } });
    fireEvent.change(ageInput, { target: { value: '30' } });
    fireEvent.change(heightInput, { target: { value: '180' } });
    fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });
    fireEvent.change(goalsTextarea, { target: { value: 'Test goals' } });

    const submitButton = screen.getByRole('button', { name: /Add Client/i });
    fireEvent.click(submitButton);

    // Assert
    expect(screen.getByText(/Test Client/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it('deletes a client', () => {
    render(<App />);

    // Arrange
    // Add a client first
    const addClientButton = screen.getByRole('button', { name: /Add Client/i });
    fireEvent.click(addClientButton);

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Client to Delete' } });
    fireEvent.change(emailInput, { target: { value: 'delete@example.com' } });

    const submitButton = screen.getByRole('button', { name: /Add Client/i });
    fireEvent.click(submitButton);

    // Act
    const deleteButton = screen.getByRole('button', { name: /Delete Client to Delete/i });
    fireEvent.click(deleteButton);

    // Assert
    expect(screen.queryByText(/Client to Delete/i)).toBeNull();
  });

  it('opens and closes the client modal', () => {
    render(<App />);

    const addClientButton = screen.getByRole('button', { name: /Add Client/i });
    fireEvent.click(addClientButton);
    expect(screen.getByText(/Add New Client/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    expect(screen.queryByText(/Add New Client/i)).toBeNull();
  });

  it('navigates to the nutrition tab', () => {
    render(<App />);
    const nutritionTab = screen.getByRole('button', { name: /Nutrition/i });
    fireEvent.click(nutritionTab);
    expect(screen.getByText(/Select Client/i)).toBeInTheDocument();
  });

  it('navigates to the workouts tab', () => {
    render(<App />);
    const workoutsTab = screen.getByRole('button', { name: /Workouts/i });
    fireEvent.click(workoutsTab);
    expect(screen.getByText(/Select Client/i)).toBeInTheDocument();
  });

 it('navigates to the measurements tab', () => {
    render(<App />);
    const measurementsTab = screen.getByRole('button', { name: /Measurements/i });
    fireEvent.click(measurementsTab);
    expect(screen.getByText(/Select Client/i)).toBeInTheDocument();
  });

 it('navigates to the dashboard tab', () => {
    render(<App />);
    const dashboardTab = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardTab);
    expect(screen.getByText(/Select Client/i)).toBeInTheDocument();
  });

 it('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('true');

    const lightModeButton = screen.getByRole('button', { name: /Switch to light mode/i });
     if (lightModeButton) { // Check if the element exists before clicking it
        fireEvent.click(lightModeButton);
    }
    expect(localStorage.getItem('darkMode')).toBe('false');
  });
});
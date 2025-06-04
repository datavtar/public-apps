import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Transport Dashboard/i)).toBeInTheDocument();
  });

  test('renders welcome fallback when data is loading', () => {
    render(<App />);
    expect(screen.getByTestId('welcome_fallback')).toBeInTheDocument();
  });

  test('renders add vehicle button', () => {
    render(<App />);
    const addVehicleButton = screen.getByRole('button', { name: /Add Vehicle/i });
    expect(addVehicleButton).toBeInTheDocument();
  });

  test('renders ai assistant button', () => {
    render(<App />);
    const aiAssistantButton = screen.getByRole('button', { name: /AI Assistant/i });
    expect(aiAssistantButton).toBeInTheDocument();
  });
});

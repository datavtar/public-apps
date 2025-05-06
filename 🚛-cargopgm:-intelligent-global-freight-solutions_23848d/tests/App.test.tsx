import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);

    // Check for the logo text
    expect(screen.getByText(/CargoPGM/i)).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Solutions/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/Features/i)).toBeInTheDocument();
    expect(screen.getByText(/Testimonials/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact/i)).toBeInTheDocument();

    // Check for the hero section heading
    expect(screen.getByText(/Next-Gen Intelligent Global Freight Management/i)).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);

    const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i});
    expect(darkModeButton).toBeInTheDocument();

    fireEvent.click(darkModeButton);

    // Assert that the button's aria-label has changed.
    expect(darkModeButton).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  test('opens and closes mobile menu', () => {
    render(<App />);

    const toggleMenuButton = screen.getByRole('button', {name: /Toggle menu/i});
    expect(toggleMenuButton).toBeInTheDocument();

    // Open the menu
    fireEvent.click(toggleMenuButton);
    expect(screen.getByText(/Home/i)).toBeVisible();

    // Close the menu
    fireEvent.click(toggleMenuButton);
  });

  test('renders features section', () => {
    render(<App />);

    expect(screen.getByText(/Powerful Features/i)).toBeInTheDocument();
    expect(screen.getByText(/Global Network Integration/i)).toBeInTheDocument();
    expect(screen.getByText(/Intelligent Logistics MCP/i)).toBeInTheDocument();
    expect(screen.getByText(/End-to-End Visibility/i)).toBeInTheDocument();
  });

  test('renders testimonials section', () => {
    render(<App />);

    expect(screen.getByText(/What Our Clients Say/i)).toBeInTheDocument();
    expect(screen.getByText(/Sarah Johnson/i)).toBeInTheDocument();
    expect(screen.getByText(/Michael Chen/i)).toBeInTheDocument();
    expect(screen.getByText(/Amara Okafor/i)).toBeInTheDocument();
  });

  test('renders contact section', () => {
    render(<App />);

    expect(screen.getByText(/Get in Touch/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
  });
});
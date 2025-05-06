import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the CargoPGM header', () => {
    // Arrange
    render(<App />);

    // Act
    const headerElement = screen.getByText(/CargoPGM/i);

    // Assert
    expect(headerElement).toBeInTheDocument();
  });

  test('renders the hero section with title', () => {
    // Arrange
    render(<App />);

    // Act
    const heroTitle = screen.getByText(/Global Freight Management Simplified/i);

    // Assert
    expect(heroTitle).toBeInTheDocument();
  });

  test('renders the Solutions section', () => {
    // Arrange
    render(<App />);

    // Act
    const solutionsHeading = screen.getByText(/Comprehensive Logistics Solutions/i);

    // Assert
    expect(solutionsHeading).toBeInTheDocument();
  });

  test('renders the Features section', () => {
    // Arrange
    render(<App />);

    // Act
    const featuresHeading = screen.getByText(/Powerful Platform Features/i);

    // Assert
    expect(featuresHeading).toBeInTheDocument();
  });

  test('renders the Testimonials section', () => {
    // Arrange
    render(<App />);

    // Act
    const testimonialsHeading = screen.getByText(/What Our Customers Say/i);

    // Assert
    expect(testimonialsHeading).toBeInTheDocument();
  });

  test('renders the Contact section', () => {
    // Arrange
    render(<App />);

    // Act
    const contactHeading = screen.getByText(/Get in Touch/i);

    // Assert
    expect(contactHeading).toBeInTheDocument();
  });

  test('toggles mobile menu on button click', () => {
    // Arrange
    render(<App />);
    const menuButton = screen.getByRole('button', { name: /Toggle menu/i });

    // Act
    fireEvent.click(menuButton);

    // Assert
    expect(screen.getByText(/Solutions/i)).toBeVisible();

    // Act
    fireEvent.click(menuButton);

    // Assert
    expect(screen.queryByText(/Solutions/i)).not.toBeVisible();

  });

  test('navigates to contact section on "Request Demo" button click', () => {
    // Arrange
    delete window.location
    window.location = { assign: jest.fn() } as any
    render(<App />);
    const requestDemoButton = screen.getByRole('button', { name: /Request Demo/i });

    // Act
    fireEvent.click(requestDemoButton);

    // Assert
    expect(window.location.assign).toHaveBeenCalledWith('#contact');
  });
});
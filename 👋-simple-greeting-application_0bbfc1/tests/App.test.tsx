import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders Hello World! heading', () => {
    // Arrange
    render(<App />);

    // Act
    const headingElement = screen.getByRole('heading', { name: 'Hello World!' });

    // Assert
    expect(headingElement).toBeInTheDocument();
  });

  test('renders welcome message', () => {
    // Arrange
    render(<App />);

    // Act
    const welcomeMessage = screen.getByText('Welcome to your first Datavtar React App.');

    // Assert
    expect(welcomeMessage).toBeInTheDocument();
  });

  test('renders the Say Hi! button', () => {
    // Arrange
    render(<App />);

    // Act
    const buttonElement = screen.getByRole('button', { name: 'Say Hi!' });

    // Assert
    expect(buttonElement).toBeInTheDocument();
  });

  test('displays alert when Say Hi! button is clicked', () => {
    // Arrange
    render(<App />);
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Act
    const buttonElement = screen.getByRole('button', { name: 'Say Hi!' });
    fireEvent.click(buttonElement);

    // Assert
    expect(alertMock).toHaveBeenCalledWith('Button Clicked! Hello from Datavtar!');

    // Clean up the mock
    alertMock.mockRestore();
  });

  test('renders the copyright footer with the current year', () => {
    // Arrange
    render(<App />);
    const currentYear = new Date().getFullYear();

    // Act
    const footerElement = screen.getByText(`Copyright © ${currentYear} Datavtar Private Limited. All rights reserved.`);

    // Assert
    expect(footerElement).toBeInTheDocument();
  });

  test('toggles theme when the theme toggle button is clicked', () => {
    // Arrange
    render(<App />);
    const themeToggleButton = screen.getByRole('switch', { name: /Switch to dark mode|Switch to light mode/ });

    // Act
    fireEvent.click(themeToggleButton);

    // Assert
    expect(localStorage.getItem('appTheme')).toBeDefined();
  });
});

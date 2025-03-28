import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the main application layout', () => {
    // Arrange
    
    // Act
    render(<App />);

    // Assert
    expect(screen.getByText(/EquityPro/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
  });
});
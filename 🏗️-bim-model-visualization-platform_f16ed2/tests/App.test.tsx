import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    
  });

  test('renders the BIM Modeller heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/BIM Modeller/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders the dark mode toggle', () => {
    render(<App />);
    const darkModeToggle = screen.getByRole('button', {name: /switch to dark mode/i})
    expect(darkModeToggle).toBeInTheDocument();
  });

  test('renders the select project dropdown', () => {
    render(<App />);
    const selectProjectButton = screen.getByRole('button', {name: /select project/i});
    expect(selectProjectButton).toBeInTheDocument();
  });

  
  test('renders the footer', () => {
    render(<App />);
    const footerElement = screen.getByText(/Copyright © 2025 of Datavtar Private Limited. All rights reserved./i);
    expect(footerElement).toBeInTheDocument();
  });
});
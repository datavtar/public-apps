import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/MovieStream/i)).toBeInTheDocument();
  });

  test('renders the home page by default', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /browse movies/i })).toBeInTheDocument();
  });

  test('renders the footer', () => {
    render(<App />);
    expect(screen.getByText(/Copyright © 2025 of Datavtar Private Limited/i)).toBeInTheDocument();
  });

  test('renders Login button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('renders Sign Up button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });
});

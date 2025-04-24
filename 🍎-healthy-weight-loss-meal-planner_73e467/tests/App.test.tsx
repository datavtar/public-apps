import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders header with app title', () => {
    render(<App />);
    expect(screen.getByText(/🍎 Healthy Meal Planner/i)).toBeInTheDocument();
  });

  test('renders calendar view initially', () => {
    render(<App />);
    expect(screen.getByText(/Generate Shopping List/i)).toBeInTheDocument();
  });

  test('renders navigation buttons', () => {
    render(<App />);
    expect(screen.getByText(/Calendar/i)).toBeInTheDocument();
    expect(screen.getByText(/Meals/i)).toBeInTheDocument();
    expect(screen.getByText(/Shopping/i)).toBeInTheDocument();
    expect(screen.getByText(/Stats/i)).toBeInTheDocument();
  });

  test('renders footer with copyright information', () => {
    render(<App />);
    expect(screen.getByText(/Copyright © 2025 of Datavtar Private Limited./i)).toBeInTheDocument();
  });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/My To-Do App/i)).toBeInTheDocument();
  });

  test('renders the Add New Task button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Add New Task/i })).toBeInTheDocument();
  });

  test('renders the Tasks navigation item', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Tasks/i })).toBeInTheDocument();
  });

  test('renders the Calendar navigation item', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Calendar/i })).toBeInTheDocument();
  });

  test('renders the Analytics navigation item', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Analytics/i })).toBeInTheDocument();
  });

  test('renders the Settings navigation item', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Settings/i })).toBeInTheDocument();
  });

  
});
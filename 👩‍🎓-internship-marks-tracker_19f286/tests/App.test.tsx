import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Internship Evaluation System/i)).toBeInTheDocument();
  });

  test('renders Students tab by default', () => {
    render(<App />);
    expect(screen.getByText(/Students/i)).toBeInTheDocument();
  });

  test('renders Companies tab', () => {
    render(<App />);
    expect(screen.getByText(/Companies/i)).toBeInTheDocument();
  });

  test('renders Internships tab', () => {
    render(<App />);
    expect(screen.getByText(/Internships/i)).toBeInTheDocument();
  });

  test('renders Evaluations tab', () => {
    render(<App />);
    expect(screen.getByText(/Evaluations/i)).toBeInTheDocument();
  });

  test('renders Statistics tab', () => {
    render(<App />);
    expect(screen.getByText(/Statistics/i)).toBeInTheDocument();
  });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders Manufacturo header', () => {
    render(<App />);
    expect(screen.getByText('Manufacturo')).toBeInTheDocument();
  });

  test('renders Dashboard link in navigation', () => {
    render(<App />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
  
  test('renders Production Lines link in navigation', () => {
    render(<App />);
    expect(screen.getByText('Production Lines')).toBeInTheDocument();
  });

  test('renders Scheduling link in navigation', () => {
    render(<App />);
    expect(screen.getByText('Scheduling')).toBeInTheDocument();
  });
  
  test('renders Products link in navigation', () => {
    render(<App />);
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  test('renders Maintenance link in navigation', () => {
    render(<App />);
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
  });

  test('renders Reports link in navigation', () => {
    render(<App />);
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  test('renders copyright information in the footer', () => {
    render(<App />);
    expect(screen.getByText(/Copyright © 2025 of Datavtar Private Limited. All rights reserved./i)).toBeInTheDocument();
  });
});
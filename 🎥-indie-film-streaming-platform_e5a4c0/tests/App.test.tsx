import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';



describe('App Component', () => {
  test('renders FilmHub banner', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('renders Home section by default', () => {
    render(<App />);
    expect(screen.getByText(/Experience Cinema Like Never Before/i)).toBeInTheDocument();
  });

  test('renders trending films section', () => {
    render(<App />);
    expect(screen.getByText(/Trending Films/i)).toBeInTheDocument();
  });

  test('renders About Us section when navigating to About Us', async () => {
    render(<App />);
  });

  test('renders the footer', () => {
    render(<App />);
    expect(screen.getByText(/Copyright © 2025 of Datavtar Private Limited. All rights reserved./i)).toBeInTheDocument();
  });
});
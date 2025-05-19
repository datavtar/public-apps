import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import App from '../src/App'


describe('App Component', () => {
  test('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByRole('banner', { name: /FilmHub/i });
    expect(linkElement).toBeInTheDocument();
  });

  test('renders trending films section', () => {
    render(<App />);
    expect(screen.getByText(/Trending Films/i)).toBeInTheDocument();
  });

  test('renders filmmaker promo section', () => {
    render(<App />);
    expect(screen.getByText(/Are You a Film Maker?/i)).toBeInTheDocument();
  });

  test('renders upload promo section', () => {
    render(<App />);
    expect(screen.getByText(/Share Your Film With The World/i)).toBeInTheDocument();
  });

  test('renders USP section', () => {
    render(<App />);
    expect(screen.getByText(/Why Choose FilmHub?/i)).toBeInTheDocument();
  });
})
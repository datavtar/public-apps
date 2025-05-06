import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


test('renders FilmHub title', () => {
  render(<App />);
  expect(screen.getByText(/FilmHub/i)).toBeInTheDocument();
});

test('renders the home section', () => {
  render(<App />);
  expect(screen.getByText(/Experience Cinema Like Never Before/i)).toBeInTheDocument();
});

test('finds movies section button', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /Explore Films/i })).toBeInTheDocument();
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

import '@testing-library/jest-dom'
import * as React from 'react'
import {render, screen} from '@testing-library/react'
import App from '../src/App'


test('renders FilmHub title', () => {
  render(<App />);
  const titleElement = screen.getByRole('banner', { name: /FilmHub/i });
  expect(titleElement).toBeInTheDocument();
});

test('renders trending films section', () => {
  render(<App />);
  const trendingFilmsHeading = screen.getByRole('heading', { name: /Trending Films/i });
  expect(trendingFilmsHeading).toBeInTheDocument();
});

test('renders the About Us section button in the header', () => {
    render(<App />);
    const aboutUsButton = screen.getByRole('button', { name: /About Us/i });
    expect(aboutUsButton).toBeInTheDocument();
  });

test('renders sign up button', () => {
    render(<App />);
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    expect(signUpButton).toBeInTheDocument();
});


test('renders the footer with copyright information', () => {
    render(<App />);
    const copyrightText = screen.getByText(/Copyright © 2025 of Datavtar Private Limited. All rights reserved./i);
    expect(copyrightText).toBeInTheDocument();
});
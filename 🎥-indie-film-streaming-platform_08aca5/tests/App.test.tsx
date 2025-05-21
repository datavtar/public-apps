import '@testing-library/jest-dom'
import * as React from 'react'
import {render, screen} from '@testing-library/react'
import App from '../src/App'


test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/FilmHub/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders the mission section with correct heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Our Mission: To Stream, Support, and Showcase True Cinema/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders trending films section', () => {
  render(<App />);
  const trendingFilmsHeading = screen.getByText(/Trending Films/i);
  expect(trendingFilmsHeading).toBeInTheDocument();
});

test('renders the filmmaker promo section', () => {
  render(<App />);
  const filmmakerPromoHeading = screen.getByText(/Are You a Film Maker?/i);
  expect(filmmakerPromoHeading).toBeInTheDocument();
});

test('renders the upload promo section', () => {
  render(<App />);
  const uploadPromoHeading = screen.getByText(/Share Your Film With The World/i);
  expect(uploadPromoHeading).toBeInTheDocument();
});

test('renders the big shot challenge registration section', () => {
  render(<App />);
  const bigShotChallengeHeading = screen.getByText(/Ready to register in The Big Shot Challenge/i);
  expect(bigShotChallengeHeading).toBeInTheDocument();
});

test('renders the USP section with heading', () => {
  render(<App />);
  const uspHeading = screen.getByText(/Why Choose FilmHub?/i);
  expect(uspHeading).toBeInTheDocument();
});

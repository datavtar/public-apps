import '@testing-library/jest-dom'
import * as React from 'react'
import {render, screen} from '@testing-library/react'
import App from '../src/App'


test('renders ThorneGuard title', () => {
  render(<App />)
  const titleElement = screen.getByText(/ThorneGuard/i)
  expect(titleElement).toBeInTheDocument()
})

test('renders the headquarters address correctly', () => {
  render(<App />);
  const addressElement = screen.getByText("Herengracht 449a, 1017 BR Amsterdam, Netherlands");
  expect(addressElement).toBeInTheDocument();
});

test('renders hero section title', () => {
  render(<App />);
  const heroTitle = screen.getByText(/Advanced Autonomous Defense Systems/i);
  expect(heroTitle).toBeInTheDocument();
});

test('renders about section', () => {
  render(<App />);
  const aboutSectionTitle = screen.getByText(/Leading the Future of Autonomous Defense/i);
  expect(aboutSectionTitle).toBeInTheDocument();
});

test('renders products section', () => {
  render(<App />);
  const productsSectionTitle = screen.getByText(/Advanced Defense Product Portfolio/i);
  expect(productsSectionTitle).toBeInTheDocument();
});

test('renders news section', () => {
  render(<App />);
  const newsSectionTitle = screen.getByText(/Latest News & Updates/i);
  expect(newsSectionTitle).toBeInTheDocument();
});

test('renders contact section', () => {
  render(<App />);
  const contactSectionTitle = screen.getByText(/Get in Touch/i);
  expect(contactSectionTitle).toBeInTheDocument();
});


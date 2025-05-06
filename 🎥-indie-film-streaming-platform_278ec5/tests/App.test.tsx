import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByRole('banner', {name: /^filmhub$/i});
  expect(linkElement).toBeInTheDocument();
});

test('navigates to movies section', () => {
  render(<App />);
  const moviesLink = screen.getByRole('button', { name: /^movies$/i });
  fireEvent.click(moviesLink);
  expect(screen.getByText(/explore our film collection/i)).toBeInTheDocument();
});

test('opens sign up modal', async () => {
  render(<App />);
  const signUpButton = screen.getByRole('button', { name: /^sign up$/i });
  fireEvent.click(signUpButton);
  expect(screen.getByText(/create account/i)).toBeInTheDocument();
});

test('phone number input is present in sign up modal', async () => {
  render(<App />);
  const signUpButton = screen.getByRole('button', { name: /^sign up$/i });
  fireEvent.click(signUpButton);
  expect(screen.getByLabelText(/contact number/i)).toBeInTheDocument();
});

test('contact us link navigates to contact section', () => {
  render(<App />);
  const contactUsLink = screen.getByRole('button', { name: /^contact us$/i });
  fireEvent.click(contactUsLink);
  expect(screen.getByText(/get in touch/i)).toBeInTheDocument();
});

test('big short challenge link navigates to challenge section', () => {
  render(<App />);
  const challengeLink = screen.getByRole('button', { name: /^big short challenge$/i });
  fireEvent.click(challengeLink);
  expect(screen.getByText(/create. compete. get discovered./i)).toBeInTheDocument();
});

test('renders trending films section', () => {
  render(<App />);
  expect(screen.getByText(/trending films/i)).toBeInTheDocument();
});

test('toggles dark mode', () => {
  render(<App />);
  const themeToggle = screen.getByRole('button', { name: /switch to/i });
  fireEvent.click(themeToggle);
  //dark mode functionality is tested by checking if dark class is set on root element
  expect(document.documentElement.classList.contains('dark')).toBe(true)
  fireEvent.click(themeToggle)
  expect(document.documentElement.classList.contains('dark')).toBe(false)
});
import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../src/App'


describe('App Component', () => {
  test('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByText(/FilmHub/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('check for Sign Up button', () => {
    render(<App />);
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    expect(signUpButton).toBeInTheDocument();
  });

  test('opens sign up modal when sign up button is clicked', async () => {
    render(<App />);
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(signUpButton);
    expect(screen.getByText(/Full Name/i)).toBeVisible();
  });

  test('renders the main sections of the app', () => {
    render(<App />);
    expect(screen.getByText(/FilmHub/i)).toBeInTheDocument();
  });

  test('renders trending movies section', () => {
    render(<App />);
    expect(screen.getByText(/Trending Films/i)).toBeInTheDocument();
  });

  test('renders filmmaker promo section', () => {
    render(<App />);
    expect(screen.getByText(/Are You a Film Maker?/i)).toBeInTheDocument();
  });

  test('renders USP section', () => {
    render(<App />);
    expect(screen.getByText(/Why Choose FilmHub?/i)).toBeInTheDocument();
  });

  test('checks for upload movie modal content', async () => {
    render(<App />);
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(signUpButton);

    const roleSelect = screen.getByRole('combobox', {name: /I am a:/i})
    fireEvent.change(roleSelect, { target: { value: 'filmmaker' } })

    const uploadButton = screen.getByRole('button', { name: /Create Account/i });
    expect(uploadButton).toBeInTheDocument();
  })

  test('checks for the Short description and language of film fields when in upload Movie Section', async () => {
    render(<App />);
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(signUpButton);

    const roleSelect = screen.getByRole('combobox', {name: /I am a:/i})
    fireEvent.change(roleSelect, { target: { value: 'filmmaker' } })

    const uploadButton = screen.getByRole('button', { name: /Create Account/i });
    expect(uploadButton).toBeInTheDocument();

  });
});
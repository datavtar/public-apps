import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders learn react link', () => {
    render(<App />);
    expect(screen.getByText(/FilmHub/i)).toBeInTheDocument();
  });

  test('navigates to movies section when movies link is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Movies/i));
    expect(screen.getByText(/Explore Our Film Collection/i)).toBeInTheDocument();
  });

  test('navigates to the Big Short Challenge section', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Big Short Challenge/i));
    expect(screen.getByText(/Big Short Challenge/i)).toBeInTheDocument();
  });

  test('navigates to the Contact Us section', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Contact Us/i));
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
  });

  test('opens the sign-up modal when the sign-up button is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    expect(screen.getByText(/Sign Up/i)).toBeVisible();
  });

  test('opens the sign-in modal when the sign-in button is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    expect(screen.getByText(/Sign In/i)).toBeVisible();
  });

  test('closes the modal when the backdrop is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    fireEvent.click(screen.getByClassName('modal-backdrop'));
    expect(screen.queryByText(/Sign In/i)).not.toBeVisible();
  });

  test('renders the contact form in Contact Us Section', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Contact Us/i));
    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
  });

  test('phone number validation error shows up', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test Name' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Contact Number/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    expect(screen.getByText(/Please enter a valid phone number/i)).toBeInTheDocument();
  });

  test('navigates to filmmaker section when filmmaker link is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/I am a Film Maker/i));
    expect(screen.getByText(/Bring Your Vision To Life/i)).toBeInTheDocument();
  });

  test('design confirmation message appears when button is clicked in filmmaker section', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/I am a Film Maker/i));
    fireEvent.click(screen.getByRole('button', { name: /Confirm Design/i }));
    expect(screen.getByText(/Design confirmed! Your new filmmaker banner is ready./i)).toBeInTheDocument();
  });
});
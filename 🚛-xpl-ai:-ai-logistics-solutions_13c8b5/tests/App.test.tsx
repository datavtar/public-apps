import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';



describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Toggle menu/i })).toBeInTheDocument();
  });

  test('navigates to about section when About link is clicked', () => {
    render(<App />);
    const aboutLink = screen.getByRole('button', { name: /About/i });
    fireEvent.click(aboutLink);
  });

  test('navigates to solutions section when Solutions link is clicked', () => {
    render(<App />);
    const solutionsLink = screen.getByRole('button', { name: /Solutions/i });
    fireEvent.click(solutionsLink);
  });

  test('navigates to technology section when Technology link is clicked', () => {
    render(<App />);
    const technologyLink = screen.getByRole('button', { name: /Technology/i });
    fireEvent.click(technologyLink);
  });

  test('navigates to contact section when Contact link is clicked', () => {
    render(<App />);
    const contactLink = screen.getByRole('button', { name: /Contact/i });
    fireEvent.click(contactLink);
  });

  test('toggles dark mode when the dark mode button is clicked', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeButton);
  });

  test('opens and closes the mobile menu', () => {
    render(<App />);
    const menuButton = screen.getByRole('button', { name: /Toggle menu/i });

    fireEvent.click(menuButton);
    expect(screen.getByRole('button', { name: /Home/i })).toBeVisible();

    const closeMenuButton = screen.getByRole('button', { name: /Toggle menu/i });
    fireEvent.click(closeMenuButton);
  });

  test('updates contact form input values', () => {
    render(<App />);
    const nameInput = screen.getByLabelText(/Your Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Name' } });
    expect(nameInput.value).toBe('Test Name');

    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');

    const messageInput = screen.getByLabelText(/Message/i);
    fireEvent.change(messageInput, { target: { value: 'Test Message' } });
    expect(messageInput.value).toBe('Test Message');
  });

});
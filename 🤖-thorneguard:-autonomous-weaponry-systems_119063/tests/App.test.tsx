import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders ThorneGuard title', () => {
    render(<App />);
    expect(screen.getByText(/ThorneGuard/i)).toBeInTheDocument();
  });

  test('renders the home section', () => {
    render(<App />);
    expect(screen.getByText(/Advanced/i)).toBeInTheDocument();
  });

  test('renders the about section', () => {
    render(<App />);
    expect(screen.getByText(/Leading the Future of/i)).toBeInTheDocument();
  });

  test('renders the products section', () => {
    render(<App />);
    expect(screen.getByText(/Advanced Defense/i)).toBeInTheDocument();
  });

  test('renders the news section', () => {
    render(<App />);
    expect(screen.getByText(/Latest News & Updates/i)).toBeInTheDocument();
  });

  test('renders the contact section', () => {
    render(<App />);
    expect(screen.getByText(/Get in Touch/i)).toBeInTheDocument();
    expect(screen.getByText(/Herengracht 557, Amsterdam, Netherlands/i)).toBeInTheDocument();
  });
  
  test('updates contact form state on input change', () => {
    render(<App />);
    const nameInput = screen.getByLabelText(/Name \*/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Test Name' } });
    expect(nameInput.value).toBe('Test Name');
  });

  test('displays an alert on form submission', () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<App />);
    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);
    expect(alertMock).toHaveBeenCalledTimes(1);
    alertMock.mockRestore();
  });

  test('toggles mobile menu', () => {
    render(<App />);
    const menuButton = screen.getByRole('button', {name: /Toggle mobile menu/i});

    fireEvent.click(menuButton);
    expect(screen.getByText(/Home/i)).toBeVisible();

    fireEvent.click(menuButton);
    expect(screen.queryByText(/Home/i)).not.toBeInTheDocument();
  });
});
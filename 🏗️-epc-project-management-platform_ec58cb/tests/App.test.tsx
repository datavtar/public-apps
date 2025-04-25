import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByText(/EPCNXT/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });

    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('true');

    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });

  test('navigates to services section', () => {
    render(<App />);
    const servicesLink = screen.getByText(/Services/i);
    fireEvent.click(servicesLink);
    expect(screen.getByText(/Our Services/i)).toBeInTheDocument();
  });

  test('navigates to projects section', () => {
    render(<App />);
    const projectsLink = screen.getByText(/Projects/i);
    fireEvent.click(projectsLink);
    expect(screen.getByText(/Our Projects/i)).toBeInTheDocument();
  });

  test('navigates to about section', () => {
    render(<App />);
    const aboutLink = screen.getByText(/About/i);
    fireEvent.click(aboutLink);
    expect(screen.getByText(/About EPCNXT/i)).toBeInTheDocument();
  });

  test('navigates to contact section', () => {
    render(<App />);
    const contactLink = screen.getByText(/Contact/i);
    fireEvent.click(contactLink);
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
  });

  test('filters projects by status', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Projects/i));
    const statusFilter = screen.getByLabelText(/Status:/i);
    fireEvent.change(statusFilter, { target: { value: 'Completed' } });
  });

  test('opens and closes the project modal', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Projects/i));
    const addProjectButton = screen.getByRole('button', { name: /Add New Project/i });
    fireEvent.click(addProjectButton);
    expect(screen.getByText(/Add New Project/i)).toBeInTheDocument();
    const cancelButton = screen.getByRole('button', {name: /Cancel/i});
    fireEvent.click(cancelButton);
  });

  test('handles contact form submission', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Contact/i));
    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    const messageInput = screen.getByLabelText(/Message/i);
    const submitButton = screen.getByRole('button', { name: /Submit Message/i });

    fireEvent.change(nameInput, { target: { value: 'Test Name' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '123-456-7890' } });
    fireEvent.change(messageInput, { target: { value: 'Test Message' } });
    
    // Mock the window.alert function
    window.alert = jest.fn();

    fireEvent.click(submitButton);

    expect(window.alert).toHaveBeenCalledWith('Thank you for your message. We will get back to you soon!');
  });
});
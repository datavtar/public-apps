import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByText(/CV App/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('toggles theme correctly', () => {
    render(<App />);
    const toggleButton = screen.getByRole('button', { name: /Toggle theme/i });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('navigates to About section', () => {
    render(<App />);
    const aboutLink = screen.getByRole('button', { name: /About/i });
    fireEvent.click(aboutLink);
    expect(screen.getByText(/About Me/i)).toBeInTheDocument();
  });

  test('navigates to Experience section', () => {
    render(<App />);
    const experienceLink = screen.getByRole('button', { name: /Experience/i });
    fireEvent.click(experienceLink);
    expect(screen.getByText(/Senior Product Manager/i)).toBeInTheDocument();
  });

    test('navigates to Projects section', () => {
    render(<App />);
    const projectsLink = screen.getByRole('button', { name: /Projects/i });
    fireEvent.click(projectsLink);

    });

  test('navigates to Skills section', () => {
    render(<App />);
    const skillsLink = screen.getByRole('button', { name: /Skills/i });
    fireEvent.click(skillsLink);
    expect(screen.getByText(/Technical Skills/i)).toBeInTheDocument();
  });

  test('navigates to Education section', () => {
    render(<App />);
    const educationLink = screen.getByRole('button', { name: /Education/i });
    fireEvent.click(educationLink);
    expect(screen.getByText(/Stanford University/i)).toBeInTheDocument();
  });

  test('navigates to Contact section', () => {
    render(<App />);
    const contactLink = screen.getByRole('button', { name: /Contact/i });
    fireEvent.click(contactLink);
    expect(screen.getByText(/Contact Information/i)).toBeInTheDocument();
  });
  
  test('opens and closes the mobile menu', () => {
    render(<App />);
    const openMenuButton = screen.getByRole('button', { name: /Open menu/i });
    fireEvent.click(openMenuButton);
    expect(screen.getByRole('button', { name: /Close menu/i })).toBeInTheDocument();
    const closeMenuButton = screen.getByRole('button', { name: /Close menu/i });
    fireEvent.click(closeMenuButton);
    expect(screen.queryByRole('button', { name: /Close menu/i })).not.toBeInTheDocument();
  });
});

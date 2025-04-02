import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('displays personal information', () => {
    render(<App />);
    expect(screen.getByText('Senior Product Manager')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
  });

  test('navigates to experience section', async () => {
    render(<App />);
    const experienceLink = screen.getByText('Experience');
    fireEvent.click(experienceLink);
    expect(screen.getByText('Professional Experience')).toBeInTheDocument();
  });

  test('navigates to projects section', async () => {
    render(<App />);
    const projectsLink = screen.getByText('Projects');
    fireEvent.click(projectsLink);
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  test('navigates to skills section', async () => {
    render(<App />);
    const skillsLink = screen.getByText('Skills');
    fireEvent.click(skillsLink);
    expect(screen.getByText('Skills & Expertise')).toBeInTheDocument();
  });

  test('navigates to education section', async () => {
    render(<App />);
    const educationLink = screen.getByText('Education');
    fireEvent.click(educationLink);
    expect(screen.getByText('Education')).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', {name: /switch to dark mode/i});
    fireEvent.click(darkModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    const lightModeButton = screen.getByRole('button', {name: /switch to light mode/i});
    fireEvent.click(lightModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('displays career highlights', () => {
    render(<App />);
    expect(screen.getByText('Career Highlights')).toBeInTheDocument();
  });

});
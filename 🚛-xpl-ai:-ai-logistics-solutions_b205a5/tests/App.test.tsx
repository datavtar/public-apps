import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the logo', () => {
    render(<App />);
    const logoText = screen.getByText(/XPL-AI/i);
    expect(logoText).toBeInTheDocument();
  });

  test('renders the hero section heading', () => {
    render(<App />);
    const heading = screen.getByText(/Revolutionizing Logistics/i);
    expect(heading).toBeInTheDocument();
  });

  test('renders the about section', () => {
    render(<App />);
    const aboutSectionHeading = screen.getByText(/About XPL-AI/i);
    expect(aboutSectionHeading).toBeInTheDocument();
  });

    test('renders the solutions section', () => {
    render(<App />);
    const solutionsSectionHeading = screen.getByText(/Our AI-Powered Solutions/i);
    expect(solutionsSectionHeading).toBeInTheDocument();
  });

  test('renders the case studies section', () => {
    render(<App />);
    const caseStudiesSectionHeading = screen.getByText(/Customer Success Stories/i);
    expect(caseStudiesSectionHeading).toBeInTheDocument();
  });

  test('renders the team section', () => {
    render(<App />);
    const teamSectionHeading = screen.getByText(/Meet Our Team/i);
    expect(teamSectionHeading).toBeInTheDocument();
  });

  test('renders the contact section', () => {
    render(<App />);
    const contactSectionHeading = screen.getByText(/Get in Touch/i);
    expect(contactSectionHeading).toBeInTheDocument();
  });

  test('renders the footer', () => {
    render(<App />);
    const copyrightText = screen.getByText(/Copyright © 2025 of Datavtar Private Limited/i);
    expect(copyrightText).toBeInTheDocument();
  });
});
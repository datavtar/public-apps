import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the ThorneGuard title', () => {
    render(<App />);
    const titleElement = screen.getByText(/ThorneGuard/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders the hero section with main heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/Advanced Autonomous Defense Systems/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders the about section heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/Leading the Future of Autonomous Defense/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders the products section heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/Advanced Defense Product Portfolio/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders the news section heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/Latest News & Updates/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders the contact section heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/Get in Touch/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders the contact form', () => {
    render(<App />);
    const nameLabel = screen.getByText(/Name \*/i);
    expect(nameLabel).toBeInTheDocument();
  });
  
  test('renders the copyright information in the footer', () => {
    render(<App />);
    const copyrightText = screen.getByText(/Copyright © 2025 of Datavtar Private Limited. All rights reserved./i);
    expect(copyrightText).toBeInTheDocument();
  });
});
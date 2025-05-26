import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders ThorneGuard title', () => {
    render(<App />);
    const titleElement = screen.getByText(/ThorneGuard/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders the hero section with heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/Advanced/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders the about section', () => {
    render(<App />);
    const aboutSectionHeading = screen.getByText(/Leading the Future of/i);
    expect(aboutSectionHeading).toBeInTheDocument();
  });

  test('renders the products section', () => {
    render(<App />);
    const productsSectionHeading = screen.getByText(/Product Portfolio/i);
    expect(productsSectionHeading).toBeInTheDocument();
  });

  test('renders the news section', () => {
    render(<App />);
    const newsSectionHeading = screen.getByText(/Latest News & Updates/i);
    expect(newsSectionHeading).toBeInTheDocument();
  });

  test('renders the contact section', () => {
    render(<App />);
    const contactSectionHeading = screen.getByText(/Get in Touch/i);
    expect(contactSectionHeading).toBeInTheDocument();
  });

  test('renders the copyright text in the footer', () => {
    render(<App />);
    const copyrightText = screen.getByText(/Copyright © 2025 of Datavtar Private Limited/i);
    expect(copyrightText).toBeInTheDocument();
  });

  test('renders explore products button', () => {
    render(<App />);
    const exploreProductsButton = screen.getByRole('button', {name: /Explore Products/i});
    expect(exploreProductsButton).toBeInTheDocument();
  });

  test('renders contact us button', () => {
    render(<App />);
    const contactUsButton = screen.getByRole('button', {name: /Contact Us/i});
    expect(contactUsButton).toBeInTheDocument();
  });

  test('renders news items', () => {
    render(<App />);
    expect(screen.getByText(/ThorneGuard Unveils Next-Generation Autonomous Defense Platform/i)).toBeInTheDocument();
    expect(screen.getByText(/Partnership with Global Defense Initiative Announced/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced AI Ethics Framework Implementation/i)).toBeInTheDocument();
  });


});

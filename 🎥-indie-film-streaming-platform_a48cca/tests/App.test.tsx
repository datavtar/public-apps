import '@testing-library/jest-dom'
import * as React from 'react'
import {render, screen} from '@testing-library/react'
import App from '../src/App'


describe('App Component', () => {
  test('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByRole('banner', {name: /FilmHub/i});
    expect(linkElement).toBeInTheDocument();
  });

  test('renders the hero section with tagline', () => {
      render(<App />);
      const taglineElement = screen.getByText(/World's First OTT Platform for Your Favorite Movies/i);
      expect(taglineElement).toBeInTheDocument();
  });

  test('renders trending films section', () => {
      render(<App />);
      const trendingFilmsHeading = screen.getByText(/Trending Films/i);
      expect(trendingFilmsHeading).toBeInTheDocument();
  });

  test('renders the footer with copyright information', () => {
      render(<App />);
      const copyrightText = screen.getByText(/Copyright © 2025 of Datavtar Private Limited. All rights reserved./i);
      expect(copyrightText).toBeInTheDocument();
  });

  test('renders sign in button', () => {
      render(<App />);
      const signInButton = screen.getByRole('button', {name: /Sign In/i});
      expect(signInButton).toBeInTheDocument();
  });

  test('renders the Filmmaker Promo section', () => {
    render(<App />);
    const filmmakerPromoHeading = screen.getByText(/Are You a Film Maker?/i);
    expect(filmmakerPromoHeading).toBeInTheDocument();
  });

  test('renders the Upload Your Film Section', () => {
    render(<App />);
    const uploadSectionHeading = screen.getByText(/Share Your Film With The World/i);
    expect(uploadSectionHeading).toBeInTheDocument();
  });

})

import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByRole('banner', {name: /FilmHub/i});
    expect(linkElement).toBeInTheDocument();
  });

  test('should show trending movies section', () => {
    render(<App />);
    const trendingFilmsHeader = screen.getByText(/Trending Films/i);
    expect(trendingFilmsHeader).toBeInTheDocument();
  });

  test('should show I am a Film Maker section', () => {
    render(<App />);
    const filmMakerHeader = screen.getByText(/Are You a Film Maker?/i);
    expect(filmMakerHeader).toBeInTheDocument();
  });

  test('should show share your film section', () => {
    render(<App />);
    const shareFilmHeader = screen.getByText(/Share Your Film With The World/i);
    expect(shareFilmHeader).toBeInTheDocument();
  });

  test('should show why choose film hub section', () => {
    render(<App />);
    const whyChooseHeader = screen.getByText(/Why Choose FilmHub?/i);
    expect(whyChooseHeader).toBeInTheDocument();
  });

  test('refresh data button exists', () => {
    render(<App />);
    const refreshButton = screen.getByRole('button', { name: /refresh data/i });
    expect(refreshButton).toBeInTheDocument();
  });

  test('able to toggle dark mode', async () => {
    render(<App />);
    const toggleButton = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(localStorage.getItem('darkMode')).toBe('true');
    });

  });

  test('opens and closes sign in modal', async () => {
    render(<App />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    const signInHeader = screen.getByRole('heading', { name: /sign in/i });
    expect(signInHeader).toBeInTheDocument();

    const closeModalButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeModalButton);

  });


  test('contact form submission displays success message', async () => {
      render(<App />);
      fireEvent.click(screen.getByText(/Contact Us/i));

      fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Test message' } });

      fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

      await waitFor(() => {
          expect(screen.getByText(/Thank you for your message!/i)).toBeInTheDocument();
      });
  });

});
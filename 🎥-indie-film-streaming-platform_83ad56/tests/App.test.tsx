import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';



describe('App Component', () => {
  it('renders the component', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the hero section with tagline', () => {
    render(<App />);

    expect(screen.getByText('Introducing')).toBeInTheDocument();
    expect(screen.getByText('ABC Talkies')).toBeInTheDocument();
    expect(screen.getByText("World's First OTT Platform for Your Favorite Movies — Now with a Cinema Marketplace")).toBeInTheDocument();
  });

 it('navigates to movies section when explore films button is clicked', async () => {
    render(<App />);

    const exploreFilmsButton = screen.getByRole('button', { name: /Explore Films/i });
    fireEvent.click(exploreFilmsButton);

    expect(screen.getByText(/Explore Our Film Collection/i)).toBeInTheDocument();
  });

  it('navigates to the contact section on clicking the Contact Us link', async () => {
        render(<App />);

        const contactUsLink = screen.getByText('Contact Us');
        fireEvent.click(contactUsLink);

        expect(screen.getByText(/Get In Touch/i)).toBeInTheDocument();
    });

 it('displays and closes the sign in modal', async () => {
    render(<App />);

    const signInButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(signInButton);

    expect(screen.getByRole('heading', { name: /Sign In/i })).toBeInTheDocument();

    const closeModalButton = screen.getByRole('button', { 'aria-label': /Close modal/i });
    fireEvent.click(closeModalButton);

    //Give time to react
     await new Promise((r) => setTimeout(r, 100));

     expect(() => screen.getByRole('heading', { name: /Sign In/i })).toThrow();
  });

  it('displays and closes the sign up modal', async () => {
    render(<App />);

    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(signUpButton);

    expect(screen.getByRole('heading', { name: /Sign Up/i })).toBeInTheDocument();

    const closeModalButton = screen.getByRole('button', { 'aria-label': /Close modal/i });
    fireEvent.click(closeModalButton);

     await new Promise((r) => setTimeout(r, 100));

    expect(() => screen.getByRole('heading', { name: /Sign Up/i })).toThrow();
  });

 it('renders Trending Films section with movie cards', () => {
    render(<App />);
    expect(screen.getByText(/Trending Films/i)).toBeInTheDocument();
  });

  it('should refresh data when the refresh button is clicked', () => {
    render(<App />);

    const refreshButton = screen.getByRole('button', { name: /Refresh data/i });
    fireEvent.click(refreshButton);

    // Check for success notification
    expect(screen.getByText(/Data refreshed successfully/i)).toBeInTheDocument();
  });
});
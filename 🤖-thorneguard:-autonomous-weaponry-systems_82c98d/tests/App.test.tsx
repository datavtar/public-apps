import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the authContext
const mockAuthContextValue = {
  currentUser: null,
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
  resetPassword: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn()
};



describe('App Component', () => {
  test('renders ThorneGuard title', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    const titleElement = screen.getByText(/THORNEGUARD/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders the hero section on the home page', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    const heroTitle = screen.getByText(/Autonomous Defense Systems/i);
    expect(heroTitle).toBeInTheDocument();
  });

  test('navigates to products page when Explore Systems button is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    const exploreButton = screen.getByRole('button', { name: /Explore Systems/i });
    fireEvent.click(exploreButton);
    await waitFor(() => {
      expect(screen.getByText(/Defense Systems Portfolio/i)).toBeInTheDocument();
    });
  });

  test('navigates to contact page when Request Access button is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    const requestAccessButton = screen.getByRole('button', { name: /Request Access/i });
    fireEvent.click(requestAccessButton);
    await waitFor(() => {
      expect(screen.getByText(/Contact ThorneGuard/i)).toBeInTheDocument();
    });
  });

  test('displays product cards on the products page', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    const exploreButton = screen.getByRole('button', { name: /Explore Systems/i });
    fireEvent.click(exploreButton);
    await waitFor(() => {
      expect(screen.getByText(/Defense Systems Portfolio/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/THOR-1 Autonomous Sentry/i)).toBeInTheDocument();
  });

  test('displays About ThorneGuard content on the about page', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText(/About/i));

    await waitFor(() => {
      expect(screen.getByText(/About ThorneGuard/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Pioneering the future of autonomous defense/i)).toBeInTheDocument();
  });

  test('displays Contact ThorneGuard form on the contact page', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText(/Contact/i));

    await waitFor(() => {
      expect(screen.getByText(/Contact ThorneGuard/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
  });

  test('displays settings page', async () => {
      render(
        <AuthContext.Provider value={mockAuthContextValue}>
          <App />
        </AuthContext.Provider>
      );

      fireEvent.click(screen.getByText(/Settings/i));

      await waitFor(() => {
        expect(screen.getByText(/Settings/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Customize your ThorneGuard experience/i)).toBeInTheDocument();
  });

});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
  updatePassword: jest.fn(),
};

// Helper function to render the component with the mock context
const renderWithAuthContext = (ui: React.ReactElement) => {
  return render(<AuthContext.Provider value={mockAuthContextValue}>{ui}</AuthContext.Provider>);
};


descibe('App Component', () => {

  it('renders the component', () => {
    renderWithAuthContext(<App />);
    expect(screen.getByText('ThorneGuard')).toBeInTheDocument();
  });

  it('renders the home page by default', () => {
    renderWithAuthContext(<App />);
    expect(screen.getByText('Autonomous Defense')).toBeInTheDocument();
  });

  it('navigates to the products page when the Products link is clicked', async () => {
    renderWithAuthContext(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Products/i }));
    await waitFor(() => {
      expect(screen.getByText('Defense Systems Portfolio')).toBeInTheDocument();
    });
  });

  it('navigates to the technology page when the Technology link is clicked', async () => {
    renderWithAuthContext(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Technology/i }));
    await waitFor(() => {
      expect(screen.getByText('Advanced AI Technology')).toBeInTheDocument();
    });
  });

  it('navigates to the about page when the About link is clicked', async () => {
    renderWithAuthContext(<App />);
    fireEvent.click(screen.getByRole('button', { name: /About/i }));
    await waitFor(() => {
      expect(screen.getByText('About ThorneGuard')).toBeInTheDocument();
    });
  });

  it('navigates to the contact page when the Contact link is clicked', async () => {
    renderWithAuthContext(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Contact/i }));
    await waitFor(() => {
      expect(screen.getByText('Contact ThorneGuard')).toBeInTheDocument();
    });
  });

  it('renders the footer', () => {
    renderWithAuthContext(<App />);
    expect(screen.getByText('Copyright © 2025 Datavtar Private Limited. All rights reserved.')).toBeInTheDocument();
  });

  it('renders the welcome message when the user is logged in', () => {
    const mockAuthContextValueWithUser = {
      ...mockAuthContextValue,
      currentUser: { first_name: 'Test' },
    };

    const renderWithAuthContextAndUser = (ui: React.ReactElement) => {
      return render(<AuthContext.Provider value={mockAuthContextValueWithUser}>{ui}</AuthContext.Provider>);
    };

    renderWithAuthContextAndUser(<App />);
    expect(screen.getByText('Welcome, Test')).toBeInTheDocument();
  });

  it('opens and closes the mobile menu', () => {
    renderWithAuthContext(<App />);
    const toggleButton = screen.getByRole('button', { name: /Toggle menu/i });

    // Open the menu
    fireEvent.click(toggleButton);
    expect(screen.getByRole('button', { name: /Home/i })).toBeVisible();

    // Close the menu
    fireEvent.click(toggleButton);
    
  });

});
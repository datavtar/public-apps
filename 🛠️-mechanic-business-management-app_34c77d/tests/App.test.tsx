import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';
import { act } from 'react-dom/test-utils';


const mockAuthContextValue = {
  currentUser: {
    uid: 'test-uid',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User'
  },
  logout: jest.fn(),
  signup: jest.fn(),
  login: jest.fn(),
  signInWithGoogle: jest.fn(),
  resetPassword: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn()
};


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByText(/AutoPro Manager/i)).toBeInTheDocument();
  });

  it('navigates to the customers view when the Customers navigation button is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    const customersNavButton = screen.getByRole('button', { name: /Customers/i });

    act(() => {
      customersNavButton.click();
    });

    expect(screen.getByText(/Manage your customer database/i)).toBeInTheDocument();
  });

  it('displays the dashboard view by default', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Today's overview and quick stats/i)).toBeInTheDocument();
  });

  it('renders welcome message with current user\'s first name', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByText(/Welcome, Test/i)).toBeInTheDocument();
  });

  it('renders the dashboard with fallback text when data loads', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByTestId('welcome_fallback')).toBeInTheDocument();
  });

});

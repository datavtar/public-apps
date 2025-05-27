import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';
import { AuthProvider } from '../src/contexts/authContext';

// Mock the authContext to avoid needing a real user
const mockAuthContext = {
  currentUser: null,
  login: jest.fn(),
  logout: jest.fn(),
};

jest.mock('../src/contexts/authContext', () => ({
    useAuth: () => mockAuthContext,
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));


describe('App Component', () => {
  test('renders navigation bar with correct links', () => {
    render(
        <AuthProvider>
            <App />
        </AuthProvider>
    );

    expect(screen.getByText('Richmond Bar Foundation')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Eligibility Check')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('renders home page by default', () => {
    render(
        <AuthProvider>
            <App />
        </AuthProvider>
    );

    expect(screen.getByText('Eviction Diversion Program')).toBeInTheDocument();
    expect(screen.getByText(/Get help resolving rental disputes before they reach court/i)).toBeInTheDocument();
  });

  test('navigates to chatbot page when "Check Your Eligibility" button is clicked', () => {
    render(
        <AuthProvider>
            <App />
        </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Check Your Eligibility/i }));
    expect(screen.getByText(/Chat with our AI assistant to check if you qualify/i)).toBeInTheDocument();
  });

  test('navigates to resources page when "View Resources" button is clicked', () => {
    render(
        <AuthProvider>
            <App />
        </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /View Resources/i }));
    expect(screen.getByText(/Helpful Resources/i)).toBeInTheDocument();
  });

    test('displays initial chatbot message when starting a new conversation', async () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );

        // Navigate to chatbot page
        fireEvent.click(screen.getByRole('button', { name: /Eligibility Check/i }));

        // Start a new conversation
        fireEvent.click(screen.getByRole('button', { name: /Start Eligibility Check/i }));

        // Check if the initial message is displayed
        expect(await screen.findByText(/Hello! I'm here to help you check your eligibility/i)).toBeVisible();
    });
});
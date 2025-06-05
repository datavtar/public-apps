import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the auth context
const mockAuthContextValue = {
  currentUser: {
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User'
  },
  logout: jest.fn(),
};


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders the component', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    // Wait for the component to render its content
    await waitFor(() => {
      expect(screen.getByText(/Protein Bar Analytics/i)).toBeInTheDocument();
    });
  });

  test('displays welcome message with user\'s name', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome, Test/i)).toBeInTheDocument();
    });
  });

  test('renders dashboard view by default', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Market Overview/i)).toBeInTheDocument();
    });
  });

  test('navigates to consumers view when Consumers link is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      const consumersLink = screen.getByText(/Consumers/i);
      userEvent.click(consumersLink);
      expect(screen.getByText(/Consumer Profiles/i)).toBeInTheDocument();
    });
  });

  test('navigates to AI Analytics view when AI Analytics link is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      const analyticsLink = screen.getByText(/AI Analytics/i);
      userEvent.click(analyticsLink);
      expect(screen.getByText(/AI-Powered Analytics/i)).toBeInTheDocument();
    });
  });

  test('navigates to Market Trends view when Market Trends link is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      const trendsLink = screen.getByText(/Market Trends/i);
      userEvent.click(trendsLink);
      expect(screen.getByText(/Market Trends & Insights/i)).toBeInTheDocument();
    });
  });

  test('navigates to Settings view when Settings link is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      const settingsLink = screen.getByText(/Settings/i);
      userEvent.click(settingsLink);
      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });
  });

  test('calls logout function when Logout button is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /Logout/i });
      userEvent.click(logoutButton);
      expect(mockAuthContextValue.logout).toHaveBeenCalledTimes(1);
    });
  });

  test('renders Total Consumers stat card with initial data', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  test('adds a new consumer', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      const consumersLink = screen.getByText(/Consumers/i);
      userEvent.click(consumersLink);
    });

    await waitFor(() => {
      const addConsumerButton = screen.getByRole('button', { name: /Add Consumer/i });
      userEvent.click(addConsumerButton);
    });

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Name \*/i);
      const ageInput = screen.getByLabelText(/Age \*/i);
      const genderSelect = screen.getByLabelText(/Gender \*/i);

      userEvent.type(nameInput, 'New Consumer');
      userEvent.type(ageInput, '30');
      userEvent.selectOptions(genderSelect, 'Male');

      const addConsumerSubmitButton = screen.getByRole('button', { name: /Add Consumer/i });
      userEvent.click(addConsumerSubmitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/New Consumer/i)).toBeInTheDocument();
    });
  });
});
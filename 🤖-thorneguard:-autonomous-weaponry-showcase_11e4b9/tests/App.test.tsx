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
};

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders ThorneGuard title', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByText('ThorneGuard')).toBeInTheDocument();
  });

  test('renders hero section with correct text', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByText(/Autonomous Defense/i)).toBeInTheDocument();
    expect(screen.getByText(/Protecting nations through cutting-edge robotics and artificial intelligence./i)).toBeInTheDocument();
  });

  test('navigates to products section when "Explore Systems" button is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    const exploreButton = screen.getByRole('button', { name: /Explore Systems/i });
    fireEvent.click(exploreButton);

    // Wait for the products section to be scrolled into view (check for a text within that section)
    await waitFor(() => {
      expect(screen.getByText(/Defense Systems Portfolio/i)).toBeInTheDocument();
    });
  });

  test('opens and closes settings modal', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    const settingsButton = screen.getByRole('button', {name: /Settings/i});
    fireEvent.click(settingsButton);

    // Check if the settings modal is open
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();

    // Close the settings modal
    const closeButton = screen.getByRole('button', {name: /Close settings/i});
    fireEvent.click(closeButton);

      //Wait for the settings to close
    await waitFor(() => {
      expect(screen.queryByText(/Settings/i)).not.toBeInTheDocument();
    })
  });

  test('updates settings and saves to local storage', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    const settingsButton = screen.getByRole('button', {name: /Settings/i});
    fireEvent.click(settingsButton);

    const languageSelect = screen.getByLabelText('Language') as HTMLSelectElement;
    fireEvent.change(languageSelect, { target: { value: 'es' } });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'thorneguard_settings',
      JSON.stringify({
        language: 'es',
        theme: 'dark',
        notifications: true,
      })
    );
  });

    test('displays contact form and handles submission', async () => {
      render(
          <AuthContext.Provider value={mockAuthContextValue}>
              <App />
          </AuthContext.Provider>
      );
      
      const contactNameInput = screen.getByLabelText(/Full Name/i) as HTMLInputElement;
      const contactEmailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
      const contactCompanyInput = screen.getByLabelText(/Organization/i) as HTMLInputElement;
      const contactMessageTextarea = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;

      fireEvent.change(contactNameInput, { target: { value: 'Test Name' } });
      fireEvent.change(contactEmailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(contactCompanyInput, { target: { value: 'Test Company' } });
      fireEvent.change(contactMessageTextarea, { target: { value: 'Test Message' } });

      const submitButton = screen.getByRole('button', { name: /Send Secure Message/i });
      fireEvent.click(submitButton);

       await waitFor(() => {
           expect(screen.getByText(/Message Sent/i)).toBeInTheDocument();
       });
  });


})
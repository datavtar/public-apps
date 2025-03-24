import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../src/App';
import { BrowserRouter } from 'react-router-dom';


describe('App Component', () => {
  test('renders HomePage component by default', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/Find Your Perfect Life Partner/i)).toBeInTheDocument();
  });

  test('navigates to LoginPage when Login link is clicked', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    const loginLink = screen.getByRole('link', { name: /Login/i });
    fireEvent.click(loginLink);

    await waitFor(() => {
      expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    });
  });

  test('navigates to RegisterPage when Register link is clicked', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    const registerLink = screen.getByRole('link', { name: /Register/i });
    fireEvent.click(registerLink);

    await waitFor(() => {
      expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
    });
  });

  test('ThemeToggle switches theme', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    const themeToggle = screen.getByRole('switch', { name: /Switch to dark mode/i });
    expect(themeToggle).toBeInTheDocument();
    fireEvent.click(themeToggle);
  });

  describe('LoginPage', () => {
    test('renders LoginPage component', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
      
      const loginLink = screen.getByRole('link', { name: /Login/i });
        fireEvent.click(loginLink);
        
        return waitFor(() => expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument())
    });

    test('shows error message for invalid credentials', async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      const loginLink = screen.getByRole('link', { name: /Login/i });
        fireEvent.click(loginLink);

      await waitFor(() => expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument());
      
      const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement
      const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement
      const signInButton = screen.getByRole('button', { name: /Sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(signInButton);

      await waitFor(() => {
          expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
      });
    });
  });

  describe('RegisterPage', () => {
    test('renders RegisterPage component', async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

        const registerLink = screen.getByRole('link', { name: /Register/i });
        fireEvent.click(registerLink);

        await waitFor(() => expect(screen.getByText(/Create your account/i)).toBeInTheDocument());
    });
  });

  describe('Dashboard', () => {
    test('renders Dashboard component after successful login', async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      const loginLink = screen.getByRole('link', { name: /Login/i });
      fireEvent.click(loginLink);

      await waitFor(() => expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument());

      const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement
      const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement
      const signInButton = screen.getByRole('button', { name: /Sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      fireEvent.click(signInButton);

      await waitFor(() => {
          expect(screen.getByText(/Discover Profiles/i)).toBeInTheDocument();
      });
    });
  });
});
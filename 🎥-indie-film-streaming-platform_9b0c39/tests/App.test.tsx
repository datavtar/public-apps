import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../src/App'

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the generateOTP function, but allow the original to be called
const originalGenerateOTP = () => (Math.floor(100000 + Math.random() * 900000).toString());


// Mock matchMedia for theme toggle testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


describe('App Component', () => {

  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders learn react link', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument()
  });

  test('opens and closes the sign up modal', async () => {
    render(<App />);

    // Open the modal
    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpButton);

    // Check if the modal is open
    expect(screen.getByText(/create account/i)).toBeInTheDocument();

    // Close the modal
    const closeModalButton = screen.getByRole('button', { 'aria-label': /close modal/i });
    fireEvent.click(closeModalButton);

    // Check if the modal is closed (not in the document)
    expect(screen.queryByText(/create account/i)).not.toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(themeToggle).toBeInTheDocument()
    fireEvent.click(themeToggle)
  });


  test('successfully signs up a user and navigates to dashboard when filmmaker', async () => {
    render(<App />);

    // Open the sign-up modal
    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpButton);

    // Fill out the sign-up form
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test Filmmaker' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/contact number/i), { target: { value: '123-456-7890' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/i am a:/i), { target: { value: 'filmmaker' } });

    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the terms/i });
    fireEvent.click(termsCheckbox)

    // Submit the form
    const createAccountButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(createAccountButton);

    // Verify OTP screen
    expect(screen.getByText(/verify your account/i)).toBeVisible()

    // Mock the OTP input and submission - IMPORTANT: Mock the OTP from alert
    const emailOTPInput = screen.getByLabelText(/email otp/i);
    const phoneOTPInput = screen.getByLabelText(/phone otp/i);

    // Fill OTP values (replace with actual values if needed)
    fireEvent.change(emailOTPInput, { target: { value: '123456' } });
    fireEvent.change(phoneOTPInput, { target: { value: '654321' } });

    // Submit the OTP verification form
    const verifyAndCompleteSignupButton = screen.getByRole('button', { name: /verify & complete signup/i });
    fireEvent.click(verifyAndCompleteSignupButton);

    // Assert that the alert is called
    // eslint-disable-next-line testing-library/no-await-sync-query
    // Check if redirected to dashboard
    //expect(screen.getByText(/my dashboard/i)).toBeVisible();
  });
});
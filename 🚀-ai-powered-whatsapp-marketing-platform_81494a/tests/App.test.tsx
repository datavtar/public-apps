import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders login form when not logged in', () => {
    render(<App />);
    expect(screen.getByText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByText(/Password/i)).toBeInTheDocument();
  });

  test('login with admin credentials redirects to dashboard', async () => {
    render(<App />);
    const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    // Wait for dashboard to load (adjust timeout if needed)
    await screen.findByText(/Dashboard/i, {}, { timeout: 3000 });

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  test('renders dashboard after successful login', async () => {
    render(<App />);

    // Simulate login
    const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    await screen.findByText(/Dashboard/i, {}, { timeout: 3000 });

    expect(screen.getByText(/Messages Sent/i)).toBeInTheDocument();
    expect(screen.getByText(/Message Read Rate/i)).toBeInTheDocument();
  });

  test('logout redirects to login form', async () => {
    render(<App />);

    // Simulate login
    const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    await screen.findByText(/Dashboard/i, {}, { timeout: 3000 });

    // Find and click logout button
    const logoutButton = await screen.findByLabelText(/Log out/i);
    fireEvent.click(logoutButton);

    // Check if login form is rendered
    expect(screen.getByText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByText(/Password/i)).toBeInTheDocument();
  });

  test('admin can access user management page', async () => {
    render(<App />);

    // Simulate login
    const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    await screen.findByText(/Dashboard/i, {}, { timeout: 3000 });

    // Navigate to user management
    const userManagementLink = screen.getByText(/User Management/i);
    fireEvent.click(userManagementLink);

    await screen.findByText(/Add User/i, {}, { timeout: 3000 });
    // Check if user management content is rendered
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
  });

  test('Add company modal opens when add company button is clicked', async () => {
    render(<App />);

     // Simulate login
    const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    await screen.findByText(/Dashboard/i, {}, { timeout: 3000 });

    // Navigate to companies page
    const companiesLink = screen.getByText(/Companies/i);
    fireEvent.click(companiesLink);

    await screen.findByText(/Add Company/i, {}, { timeout: 3000 });
    // Click add company button
    const addCompanyButton = screen.getByRole('button', { name: /Add Company/i });
    fireEvent.click(addCompanyButton);

    // Check if modal is open by checking for text in modal
    expect(screen.getByText(/Add New Company/i)).toBeInTheDocument();
  });
});
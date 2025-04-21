import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


descripe('App Component', () => {
 test('renders login page initially', () => {
 render(<App />);
 const loginTitle = screen.getByText(/Student Progress Tracker/i);
 expect(loginTitle).toBeInTheDocument();
 });

 test('shows login error message when invalid credentials are used', async () => {
 render(<App />);
 const emailInput = screen.getByLabelText(/Email/i);
 const passwordInput = screen.getByLabelText(/Password/i);
 const signInButton = screen.getByRole('button', { name: /Sign In/i });

 fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
 fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
 fireEvent.click(signInButton);

 // Wait for the login process to complete (adjust timeout as needed)
 await screen.findByText('Invalid email or password', {}, { timeout: 5000 });

 expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
 });



 test('navigates to students tab after successful admin login', async () => {
 render(<App />);
 const emailInput = screen.getByLabelText(/Email/i);
 const passwordInput = screen.getByLabelText(/Password/i);
 const signInButton = screen.getByRole('button', { name: /Sign In/i });

 fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
 fireEvent.change(passwordInput, { target: { value: 'admin123' } });
 fireEvent.click(signInButton);

 // Wait for the component to update after login
 await screen.findByText(/Students/i);

 expect(screen.getByText(/Students/i)).toBeInTheDocument();
 });


 test('navigates to grades tab after successful student login', async () => {
 render(<App />);
 const emailInput = screen.getByLabelText(/Email/i);
 const passwordInput = screen.getByLabelText(/Password/i);
 const signInButton = screen.getByRole('button', { name: /Sign In/i });

 // Assuming there is at least one student in the sample data
 fireEvent.change(emailInput, { target: { value: 'emma.thompson@example.com' } });
 fireEvent.change(passwordInput, { target: { value: 'password123' } });
 fireEvent.click(signInButton);

 // Wait for the component to update after login
 await screen.findByText(/Emma Thompson's Grades/i);

 expect(screen.getByText(/Emma Thompson's Grades/i)).toBeInTheDocument();
 });
});

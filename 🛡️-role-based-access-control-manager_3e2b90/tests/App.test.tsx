import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/rbac system/i)).toBeInTheDocument();
  });

  test('switches to groups view', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /groups/i }));
    await waitFor(() => {
      expect(screen.getByText(/group management/i)).toBeInTheDocument();
    });
  });

  test('adds a new user', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /add new user/i }));

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const roleSelect = screen.getByLabelText(/role/i);
    const submitButton = screen.getByRole('button', { name: /create/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(roleSelect, { target: { value: 'user' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
    });
  });

    test('deletes a user', async () => {
        render(<App />);
        //Add a user first
        fireEvent.click(screen.getByRole('button', { name: /add new user/i }));

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /create/i });

        fireEvent.change(nameInput, { target: { value: 'ToDelete User' } });
        fireEvent.change(emailInput, { target: { value: 'deletetest@example.com' } });
        fireEvent.change(roleSelect, { target: { value: 'user' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/ToDelete User/i)).toBeInTheDocument();
        });

        //Then delete
        const deleteButton = screen.getAllByRole('button', {name: /delete user/i})[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByText(/ToDelete User/i)).not.toBeInTheDocument();
        });
    });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('true');

    const lightModeButton = screen.getByRole('button', { name: /switch to light mode/i });
        if(lightModeButton){
            fireEvent.click(lightModeButton);
            expect(localStorage.getItem('darkMode')).toBe('false');
        }
  });

  test('filters users by role', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/filter/i));
    const roleSelect = await screen.findByRole('combobox', { name: /role/i });
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    await waitFor(() => {
      const userRows = screen.getAllByRole('row');
      userRows.slice(1).forEach(row => {
        if(row.textContent){
          expect(row.textContent.toLowerCase()).toContain('admin');
        }
      });
    });
  });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/CoworkingCRM/i)).toBeInTheDocument();
  });

  test('initializes with leads from local storage or sample data', () => {
    localStorage.clear();
    render(<App />);
    expect(localStorage.getItem('coworkingLeads')).not.toBeNull();
  });

  test('opens and closes the add lead modal', async () => {
    render(<App />);

    const addLeadButton = screen.getByRole('button', { name: /Add Lead/i });
    fireEvent.click(addLeadButton);

    const modalTitle = await screen.findByText(/Add New Lead/i);
    expect(modalTitle).toBeInTheDocument();

    const closeModalButton = screen.getByRole('button', { 'name': /close modal/i });
    fireEvent.click(closeModalButton);

  });

  test('adds a new lead', async () => {
    render(<App />);

    const addLeadButton = screen.getByRole('button', { name: /Add Lead/i });
    fireEvent.click(addLeadButton);

    await screen.findByText(/Add New Lead/i);

    fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'Test Lead' } });
    fireEvent.change(screen.getByLabelText(/Email \*/i), { target: { value: 'test@example.com' } });

    const addButton = screen.getByRole('button', { name: /Add Lead/i });
    fireEvent.click(addButton);

    await waitFor(() => expect(screen.getByText(/Test Lead/i)).toBeInTheDocument());
  });

  test('toggles dark mode', () => {
    render(<App />);

    const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i});
    fireEvent.click(darkModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(darkModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

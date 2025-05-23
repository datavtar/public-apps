import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';



describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<App />);
  });

  it('displays the Invoice Manager title', () => {
    render(<App />);
    expect(screen.getByText(/Invoice Manager/i)).toBeInTheDocument();
  });

  it('navigates to the invoices view when the Invoices button is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Invoices/i));
    expect(screen.getByText(/New Invoice/i)).toBeInTheDocument();
  });

  it('navigates to the clients view when the Clients button is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Clients/i));
    expect(screen.getByText(/New Client/i)).toBeInTheDocument();
  });

  it('displays the dashboard view by default', () => {
    render(<App />);
    expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Paid Invoices/i)).toBeInTheDocument();
  });

  it('allows adding a new invoice', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Invoices/i));
    fireEvent.click(screen.getByText(/New Invoice/i));

    expect(screen.getByText(/Create New Invoice/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Invoice Number/i), { target: { value: 'TEST-INV-001' } });
    fireEvent.change(screen.getByLabelText(/Client/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Issue Date/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/Due Date/i), { target: { value: '2024-02-01' } });
    fireEvent.click(screen.getByText(/Create Invoice/i));

    await waitFor(() => {
        expect(screen.queryByText(/Create New Invoice/i)).not.toBeInTheDocument();
    });
  });

  it('allows adding a new client', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Clients/i));
    fireEvent.click(screen.getByText(/New Client/i));

    expect(screen.getByText(/Add New Client/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Client Name/i), { target: { value: 'Test Client' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '123-456-7890' } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: '123 Test St' } });
    fireEvent.click(screen.getByText(/Add Client/i));

    await waitFor(() => {
        expect(screen.queryByText(/Add New Client/i)).not.toBeInTheDocument();
    });
  });

  it('updates dark mode based on the toggle', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Toggle dark mode/i });
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('true');
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.confirm
const originalConfirm = window.confirm;

beforeEach(() => {
  window.confirm = jest.fn(() => true); // Always return true for confirmation
  localStorage.clear();
});

afterEach(() => {
  window.confirm = originalConfirm;
});


test('renders the component', () => {
  render(<App />);
  expect(screen.getByText(/Property Manager Pro/i)).toBeInTheDocument();
});

test('navigates to tenants tab', async () => {
  render(<App />);
  const tenantsLink = screen.getByRole('button', { name: /tenants/i });
  fireEvent.click(tenantsLink);
  expect(screen.getByText(/Tenants/i)).toBeInTheDocument();
});

test('adds a new tenant', async () => {
  render(<App />);
  const tenantsLink = screen.getByRole('button', { name: /tenants/i });
  fireEvent.click(tenantsLink);
  const addTenantButton = screen.getByRole('button', { name: /Add Tenant/i });
  fireEvent.click(addTenantButton);

  // Fill out the form
  const nameInput = screen.getByLabelText(/Name/i);
  fireEvent.change(nameInput, { target: { value: 'Test Tenant' } });
  const emailInput = screen.getByLabelText(/Email/i);
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  const phoneInput = screen.getByLabelText(/Phone/i);
  fireEvent.change(phoneInput, { target: { value: '123-456-7890' } });
  const creditScoreInput = screen.getByLabelText(/Credit Score/i);
  fireEvent.change(creditScoreInput, { target: { value: '700' } });
  const incomeInput = screen.getByLabelText(/Annual Income/i);
  fireEvent.change(incomeInput, { target: { value: '60000' } });

  const submitButton = screen.getByRole('button', { name: /Add Tenant/i });
  fireEvent.click(submitButton);
  
  // Wait for the modal to close.  Using findBy* since state updates might take a tick.
  expect(await screen.findByText(/Test Tenant/i)).toBeInTheDocument();
});

test('deletes a tenant', async () => {
    render(<App />);
    const tenantsLink = screen.getByRole('button', { name: /tenants/i });
    fireEvent.click(tenantsLink);
  
    // Add a tenant first to ensure there is something to delete
    const addTenantButton = screen.getByRole('button', { name: /Add Tenant/i });
    fireEvent.click(addTenantButton);
  
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Tenant to Delete' } });
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'delete@example.com' } });
    const phoneInput = screen.getByLabelText(/Phone/i);
    fireEvent.change(phoneInput, { target: { value: '111-222-3333' } });
    const creditScoreInput = screen.getByLabelText(/Credit Score/i);
    fireEvent.change(creditScoreInput, { target: { value: '650' } });
    const incomeInput = screen.getByLabelText(/Annual Income/i);
    fireEvent.change(incomeInput, { target: { value: '50000' } });
  
    const submitButton = screen.getByRole('button', { name: /Add Tenant/i });
    fireEvent.click(submitButton);
    await screen.findByText(/Tenant to Delete/i);
  
    // Now try to delete the tenant
    const deleteButton = await screen.findByRole('button', { name: /trash2/i });

    fireEvent.click(deleteButton);
  
    // Expect that the tenant is no longer in the document
    expect(screen.queryByText(/Tenant to Delete/i)).toBeNull();
  });

test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i});
    fireEvent.click(darkModeButton);
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');

    const lightModeButton = screen.getByRole('button', {name: /Switch to light mode/i});
    fireEvent.click(lightModeButton);
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'false');
});
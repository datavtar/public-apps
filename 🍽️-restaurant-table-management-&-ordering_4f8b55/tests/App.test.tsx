import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


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
  });

  test('renders initial loading state', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders role selection screen', async () => {
    // Mock initial useEffect to avoid loading state
    jest.spyOn(React, 'useEffect').mockImplementationOnce((f: any) => f());
    jest.spyOn(React, 'useEffect').mockImplementationOnce((f: any) => f());
    jest.spyOn(React, 'useEffect').mockImplementationOnce((f: any) => f());
    jest.spyOn(React, 'useEffect').mockImplementationOnce((f: any) => f());

    render(<App />);

    // Wait for the loading state to disappear
    await screen.findByText('Complete Restaurant Management Solution', {}, {timeout: 3000});
    expect(screen.getByText('Complete Restaurant Management Solution')).toBeInTheDocument();
    expect(screen.getByText('Manager Portal')).toBeInTheDocument();
    expect(screen.getByText('Customer Portal')).toBeInTheDocument();
  });

  test('navigates to manager login screen', async () => {
    // Mock initial useEffect to avoid loading state
    jest.spyOn(React, 'useEffect').mockImplementationOnce((f: any) => f());
    jest.spyOn(React, 'useEffect').mockImplementationOnce((f: any) => f());
    jest.spyOn(React, 'useEffect').mockImplementationOnce((f: any) => f());
    jest.spyOn(React, 'useEffect').mockImplementationOnce((f: any) => f());

    render(<App />);

    // Wait for the loading state to disappear
    await screen.findByText('Complete Restaurant Management Solution', {}, {timeout: 3000});
    const managerButton = screen.getByText('Manager Portal');
    fireEvent.click(managerButton);

    expect(screen.getByText('Manager Login')).toBeInTheDocument();
  });

  test('navigates to customer seating screen', async () => {
    // Mock initial useEffect to avoid loading state
    jest.spyOn(React, 'useEffect').mockImplementationOnce((f: any) => f());
    jest.spyOn(React, 'useEffect').mockImplementationOnce((f: any) => f());
    jest.spyOn(React, 'useEffect').mockImplementationOnce((f: any) => f());
    jest.spyOn(React, 'useEffect').mockImplementationOnce((f: any) => f());

    render(<App />);

    // Wait for the loading state to disappear
    await screen.findByText('Complete Restaurant Management Solution', {}, {timeout: 3000});
    const customerButton = screen.getByText('Customer Portal');
    fireEvent.click(customerButton);

    expect(screen.getByText('Select your table')).toBeInTheDocument();
  });

  test('manager login with valid credentials', async () => {
    // Mock initial useEffect to avoid loading state
    jest.spyOn(React, 'useEffect').mockImplementation((f: any) => f());
    
    render(<App />);

    // Navigate to manager login
    await screen.findByText('Complete Restaurant Management Solution', {}, {timeout: 3000});
    const managerButton = screen.getByText('Manager Portal');
    fireEvent.click(managerButton);
    expect(screen.getByText('Manager Login')).toBeInTheDocument();
    
    // Enter valid credentials and submit
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'manager' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    //Expect dashboard to load
    await screen.findByText('Restaurant Management System', {}, {timeout: 3000});
    expect(screen.getByText('Restaurant Management System')).toBeInTheDocument();
  });
});
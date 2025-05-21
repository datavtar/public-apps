import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/RBAC System/i)).toBeInTheDocument();
  });

  test('navigates to users view on button click', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/users/i));
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
  });

  test('navigates to groups view on button click', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/groups/i));
    expect(screen.getByText(/Group Management/i)).toBeInTheDocument();
  });

  test('navigates to app groups view on button click', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/App Groups/i));
    expect(screen.getByText(/Application Group Management/i)).toBeInTheDocument();
  });

  test('navigates to permissions view on button click', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/permissions/i));
    expect(screen.getByText(/Permission Management/i)).toBeInTheDocument();
  });

  test('opens the add user modal', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/users/i));
    fireEvent.click(screen.getByRole('button', {name: /^Add New User$/i}));
    expect(screen.getByText(/Add New User/i)).toBeInTheDocument();
  });

  test('opens the add group modal', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/groups/i));
    fireEvent.click(screen.getByRole('button', {name: /^Add New Group$/i}));
    expect(screen.getByText(/Add New Group/i)).toBeInTheDocument();
  });

  test('opens the add app group modal', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/App Groups/i));
    fireEvent.click(screen.getByRole('button', {name: /^Add New App Group$/i}));
    expect(screen.getByText(/Add New Application Group/i)).toBeInTheDocument();
  });

  test('opens the add permission modal', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/permissions/i));
    fireEvent.click(screen.getByRole('button', {name: /^Add New Permission$/i}));
    expect(screen.getByText(/Add New Permission/i)).toBeInTheDocument();
  });
});
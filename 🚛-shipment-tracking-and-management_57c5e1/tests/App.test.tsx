import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Shipment Tracker/i)).toBeInTheDocument();
  });

  test('renders the New Shipment button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /New Shipment/i })).toBeInTheDocument();
  });

  test('renders Map View tab', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Map View/i })).toBeInTheDocument();
  });

  test('renders List View tab', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /List View/i })).toBeInTheDocument();
  });

  test('renders Analytics tab', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Analytics/i })).toBeInTheDocument();
  });

  test('renders the search input', () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/Search by ID, tracking, customer.../i);
    expect(searchInput).toBeInTheDocument();
  });


});
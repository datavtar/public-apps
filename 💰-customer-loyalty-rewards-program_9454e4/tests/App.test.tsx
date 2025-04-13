import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the App component', () => {
    render(<App />);
    expect(screen.getByText(/Loyalty Rewards/i)).toBeInTheDocument();
  });

  test('renders the Dashboard tab by default', () => {
    render(<App />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  test('renders the Total Customers stat', () => {
    render(<App />);
    expect(screen.getByText(/Total Customers/i)).toBeInTheDocument();
  });

  test('renders the Total Points Earned stat', () => {
    render(<App />);
    expect(screen.getByText(/Total Points Earned/i)).toBeInTheDocument();
  });

  test('renders the Points Redeemed stat', () => {
    render(<App />);
    expect(screen.getByText(/Points Redeemed/i)).toBeInTheDocument();
  });

  test('renders the Available Rewards stat', () => {
    render(<App />);
    expect(screen.getByText(/Available Rewards/i)).toBeInTheDocument();
  });
});
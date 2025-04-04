import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Alex Chen/i)).toBeInTheDocument();
  });

  test('renders profile section', () => {
    render(<App />);
    expect(screen.getByText(/Innovative Product Manager/i)).toBeInTheDocument();
    expect(screen.getByText(/San Francisco, CA/i)).toBeInTheDocument();
  });

  test('renders experience section', () => {
    render(<App />);
    expect(screen.getByText(/Senior Product Manager/i)).toBeInTheDocument();
    expect(screen.getByText(/Tech Innovations Inc./i)).toBeInTheDocument();
  });

 test('renders skills section', () => {
    render(<App />);
    expect(screen.getByText(/Product Management/i)).toBeInTheDocument();
  });

  test('renders education section', () => {
    render(<App />);
    expect(screen.getByText(/Stanford University/i)).toBeInTheDocument();
    expect(screen.getByText(/UC Berkeley/i)).toBeInTheDocument();
  });

 test('toggles experience details', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /Senior Product Manager/i });
    fireEvent.click(button);
    expect(screen.getByText(/Lead product strategy and execution/i)).toBeVisible();

    fireEvent.click(button);

  });

  test('renders timeline showcase data when experience is expanded', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /Product Manager/i });
    fireEvent.click(button);
    expect(screen.getByText(/Mobile App Launch Timeline/i)).toBeVisible();
    expect(screen.getByText(/Joined Startup Solutions Co./i)).toBeVisible();
  });

  test('renders mini app showcase data when experience is expanded', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /Associate Product Manager/i });
    fireEvent.click(button);
    expect(screen.getByText(/Feature Demo: Settings Panel/i)).toBeVisible();
    expect(screen.getByText(/Enable Notifications/i)).toBeVisible();
  });

  test('renders chart showcase data when experience is expanded', () => {
       render(<App />);
       const button = screen.getByRole('button', { name: /Senior Product Manager/i });
       fireEvent.click(button);
       expect(screen.getByText(/Simulated User Engagement Growth/i)).toBeVisible();
   });
});
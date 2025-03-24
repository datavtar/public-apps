import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';
import { BrowserRouter as Router } from 'react-router-dom';


// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


test('renders learn react link', () => {
  render(
      <App />
  );
  const linkElement = screen.getByRole('banner', {name: /Philanthropist Foundation/i});
  expect(linkElement).toBeInTheDocument();
});

test('toggles dark mode', () => {
  render(
      <App />
  );
  const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i});
  fireEvent.click(darkModeButton);
  expect(localStorage.getItem('darkMode')).toBe('true');
  const lightModeButton = screen.getByRole('button', {name: /Switch to light mode/i});
  fireEvent.click(lightModeButton);
  expect(localStorage.getItem('darkMode')).toBe('false');
});

test('navigation links are present', () => {
  render(
      <App />
  );
  expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'About Us' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Donate Now' })).toBeInTheDocument();
});

test('opens and closes donation modal', async () => {
    render(
        <App />
    );
    const donateButton = screen.getByRole('button', { name: 'Donate Now' });
    fireEvent.click(donateButton);
    const modalHeader = await screen.findByText(/Make a Donation/i);
    expect(modalHeader).toBeVisible();
    const closeButton = screen.getByRole('button', {name: /Close/i});
    fireEvent.click(closeButton);
    // Give time for the modal to close
    await new Promise((resolve) => setTimeout(resolve, 500)); // Adjust timeout as needed
    expect(screen.queryByText(/Make a Donation/i)).toBeNull();
});

test('displays project category on project page', async () => {
    render(
        <App />
    );

    const projectsLink = screen.getByRole('link', { name: 'Projects' });
    fireEvent.click(projectsLink);

    // Wait for the projects page to load
    await screen.findByText(/Our Projects/i);

    // Check if a project category is displayed
    expect(screen.getByText(/Water & Sanitation/i)).toBeVisible();
});
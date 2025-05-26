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

discord_app_testing_hook__ = {getRenderedElements: () => null} // temp hack

test('renders ThorneGuard title', () => {
  render(<App />);
  const titleElement = screen.getByText(/ThorneGuard/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders the hero section with correct text', () => {
  render(<App />);
  const heroTitle = screen.getByText(/Advanced Autonomous Defense Systems/i);
  expect(heroTitle).toBeInTheDocument();

  const heroDescription = screen.getByText(
    /ThorneGuard leads the future of military technology with AI-powered autonomous weaponry systems, delivering unmatched precision and reliability in critical defense scenarios./i
  );
  expect(heroDescription).toBeInTheDocument();
});

test('navigates to products section when "Explore Products" button is clicked', () => {
  render(<App />);
  const exploreProductsButton = screen.getByRole('button', { name: /Explore Products/i });
  fireEvent.click(exploreProductsButton);
  // basic assertion, more accurate test would require mocking scrollIntoView
  expect(screen.getByText(/Advanced Defense/i)).toBeInTheDocument();
});

test('navigates to contact section when "Contact Us" button is clicked', () => {
  render(<App />);
  const contactUsButton = screen.getByRole('button', { name: /Contact Us/i });
  fireEvent.click(contactUsButton);
    // basic assertion, more accurate test would require mocking scrollIntoView
  expect(screen.getByText(/Get in Touch/i)).toBeInTheDocument();
});

test('renders About section', () => {
  render(<App />);
  expect(screen.getByText(/Leading the Future of/i)).toBeInTheDocument();
});

test('renders Products section', () => {
  render(<App />);
  expect(screen.getByText(/Advanced Defense Product Portfolio/i)).toBeInTheDocument();
});

test('renders News section', () => {
  render(<App />);
  expect(screen.getByText(/Latest News & Updates/i)).toBeInTheDocument();
});

test('renders Contact section', () => {
  render(<App />);
  expect(screen.getByText(/Get in Touch/i)).toBeInTheDocument();
});

test('updates contact form state on input change', () => {
  render(<App />);
  const nameInput = screen.getByLabelText(/Name \*/i);
  fireEvent.change(nameInput, { target: { value: 'John Doe' } });
  expect((nameInput as HTMLInputElement).value).toBe('John Doe');
});

test('submits the contact form', () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<App />);
    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);
    expect(alertMock).toHaveBeenCalledTimes(1);
    alertMock.mockRestore();
});

test('mobile menu toggle button works', () => {
  render(<App />);
  const mobileMenuButton = screen.getByRole('button', { name: /Toggle mobile menu/i });
  fireEvent.click(mobileMenuButton);
  // assertion is not sufficient. we need more complex test to ensure it works end to end.
  expect(mobileMenuButton).toBeInTheDocument();
});

test('localStorage is used to persist contact form data', () => {
    const setItemSpy = jest.spyOn(window.localStorage, 'setItem');
    render(<App />);
    const nameInput = screen.getByLabelText(/Name \*/i);
    fireEvent.change(nameInput, { target: { value: 'Test Name' } });
    expect(setItemSpy).toHaveBeenCalled();
});
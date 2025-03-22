import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
 let store: { [key: string]: string } = {};
 return {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
  store[key] = String(value);
  },
  removeItem: (key: string) => {
  delete store[key];
  },
  clear: () => {
  store = {};
  },
 };
})();

Object.defineProperty(window, 'localStorage', {
 value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
 writable: true,
 value: (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // Deprecated
  removeListener: jest.fn(), // Deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
 }),
});


describe('App Component', () => {
 test('renders the component', () => {
  render(<App />);
  expect(screen.getByText('Workplace Content Management')).toBeInTheDocument();
 });

 test('toggles dark mode', () => {
  render(<App />);
  const darkModeButton = screen.getByRole('button', { name: /switch to dark mode/i });

  fireEvent.click(darkModeButton);
  expect(localStorage.getItem('darkMode')).toBe('true');

  fireEvent.click(darkModeButton);
  expect(localStorage.getItem('darkMode')).toBe('false');
 });

 test('switches tabs', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /resources/i }));
  expect(screen.getByText('Workplace Resources')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /faq/i }));
  expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /chat/i }));
  expect(screen.getByText('Workplace Assistant')).toBeInTheDocument();
 });

 test('sends a message and receives a response', async () => {
  render(<App />);
  const inputElement = screen.getByRole('textbox', { name: /message input/i });
  const sendButton = screen.getByRole('button', { name: /send message/i });

  fireEvent.change(inputElement, { target: { value: 'time off' } });
  fireEvent.click(sendButton);

  await waitFor(() => {
  expect(screen.getByText(/to request time off/i)).toBeInTheDocument();
  });
 });

 test('displays loading indicator when sending message', async () => {
  render(<App />);
  const inputElement = screen.getByRole('textbox', { name: /message input/i });
  const sendButton = screen.getByRole('button', { name: /send message/i });

  fireEvent.change(inputElement, { target: { value: 'time off' } });
  fireEvent.click(sendButton);

  await waitFor(() => {
  expect(screen.getByText('Typing...')).toBeInTheDocument();
  });
 });

 test('renders resources', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /resources/i }));
  expect(screen.getByText('Workplace Communication Best Practices')).toBeInTheDocument();
  expect(screen.getByText('Effective communication strategies for modern workplace environments.')).toBeInTheDocument();
 });

 test('renders FAQs', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /faq/i }));
  expect(screen.getByText('How do I request time off?')).toBeInTheDocument();
  expect(screen.getByText(/you can request time off through the HR portal/i)).toBeInTheDocument();
 });

 test('send button is disabled when input is empty', () => {
  render(<App />);
  const sendButton = screen.getByRole('button', { name: /send message/i });
  expect(sendButton).toBeDisabled();

  const inputElement = screen.getByRole('textbox', { name: /message input/i });
  fireEvent.change(inputElement, { target: { value: ' ' } });
  expect(sendButton).toBeDisabled();

  fireEvent.change(inputElement, { target: { value: 'hello' } });
  expect(sendButton).toBeEnabled();
 });
});
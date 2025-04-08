import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(), // New method
    removeEventListener: jest.fn(), // New method
    dispatchEvent: jest.fn(),
  })),
});


// Mock the styles module
jest.mock('../src/styles/styles.module.css', () => ({
    appContainer: 'appContainer'
}));


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders header with Gemini Chat title', () => {
    render(<App />);
    expect(screen.getByText('Gemini Chat')).toBeInTheDocument();
  });

  test('input textarea is present', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: 'Chat message input' });
    expect(inputElement).toBeInTheDocument();
  });

  test('send button is present', () => {
    render(<App />);
    const sendButton = screen.getByRole('button', { name: 'Send message' });
    expect(sendButton).toBeInTheDocument();
  });

 test('adds a message to the chat on submit', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: 'Chat message input' }) as HTMLTextAreaElement;
    const sendButton = screen.getByRole('button', { name: 'Send message' });

    fireEvent.change(inputElement, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  test('simulates bot response after user message', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: 'Chat message input' }) as HTMLTextAreaElement;
    const sendButton = screen.getByRole('button', { name: 'Send message' });

    fireEvent.change(inputElement, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/Gemini 2.0 Flash response placeholder for: "Test message"/i)).toBeInTheDocument();
    }, {timeout: 2000});
  });

  test('clears the input after submitting a message', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: 'Chat message input' }) as HTMLTextAreaElement;
    const sendButton = screen.getByRole('button', { name: 'Send message' });

    fireEvent.change(inputElement, { target: { value: 'Before submit' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(inputElement.value).toBe('');
    });
  });

  test('disables send button when input is empty', () => {
    render(<App />);
    const sendButton = screen.getByRole('button', { name: 'Send message' });
    expect(sendButton).toBeDisabled();
  });

  test('enables send button when input is not empty', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: 'Chat message input' }) as HTMLTextAreaElement;
    fireEvent.change(inputElement, { target: { value: 'Some text' } });
    const sendButton = screen.getByRole('button', { name: 'Send message' });
    expect(sendButton).toBeEnabled();
  });

  test('displays loading indicator while waiting for bot response', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: 'Chat message input' }) as HTMLTextAreaElement;
    const sendButton = screen.getByRole('button', { name: 'Send message' });

    fireEvent.change(inputElement, { target: { value: 'Another test' } });
    fireEvent.click(sendButton);

    // Check for typing dots (loading indicator)
    expect(screen.getByText('...', { exact: false })).toBeVisible();

    await waitFor(() => {
        expect(screen.queryByText('...', { exact: false })).toBeNull();
    }, {timeout: 2000});
  });

    test('toggles theme correctly', () => {
        render(<App />);
        const toggleButton = screen.getByRole('button', { name: 'Switch to dark mode' });
        expect(toggleButton).toBeInTheDocument();

        fireEvent.click(toggleButton);

        const toggleButtonLight = screen.queryByRole('button', { name: 'Switch to light mode' });

        expect(toggleButtonLight).toBeInTheDocument();

    });

    test('message delete functionality', async () => {
      render(<App />);

      const inputElement = screen.getByRole('textbox', { name: 'Chat message input' }) as HTMLTextAreaElement;
      const sendButton = screen.getByRole('button', { name: 'Send message' });

      fireEvent.change(inputElement, { target: { value: 'Message to delete' } });
      fireEvent.click(sendButton);

      await waitFor(() => expect(screen.getByText('Message to delete')).toBeInTheDocument());

      const deleteButton = screen.getByRole('button', { name: 'Delete message' });
      fireEvent.click(deleteButton);

      await waitFor(() => expect(screen.queryByText('Message to delete')).toBeNull());
    });

});
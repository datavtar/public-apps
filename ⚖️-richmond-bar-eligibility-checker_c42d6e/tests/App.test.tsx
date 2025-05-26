import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  test('renders loading state', () => {
    render(<App />);
    expect(screen.getByText('Loading chatbot...')).toBeInTheDocument();
  });

  test('renders the component without a saved session', async () => {
    render(<App />);

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading chatbot...')).not.toBeInTheDocument();
    });

    // Verify initial bot message
    expect(screen.getByText('Hello! I\'m here to help you check your eligibility for the Richmond Bar Foundation\'s Eviction Diversion Program. This program provides free legal assistance to tenants facing eviction. Let\'s get started with a few questions.')).toBeInTheDocument();

  });

  test('starts a new chat', async () => {
    render(<App />);

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading chatbot...')).not.toBeInTheDocument();
    });

    // Check if "New Chat" button exists
    const newChatButton = screen.getByRole('button', { name: /New Chat/i });
    expect(newChatButton).toBeInTheDocument();

    // Simulate clicking the "New Chat" button
    fireEvent.click(newChatButton);

    // Wait for the first question to appear
    await waitFor(() => {
      expect(screen.getByText('Do you currently have an active eviction case filed against you in Richmond?')).toBeInTheDocument();
    });
  });

  test('handles eviction case question', async () => {
    render(<App />);

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading chatbot...')).not.toBeInTheDocument();
    });

    // Wait for the first question to appear
    await waitFor(() => {
      expect(screen.getByText('Do you currently have an active eviction case filed against you in Richmond?')).toBeInTheDocument();
    });

    // Simulate clicking the "Yes, I have an eviction case" button
    const yesButton = screen.getByRole('button', { name: /Yes, I have an eviction case/i });
    fireEvent.click(yesButton);

    // Wait for the next question to appear
    await waitFor(() => {
      expect(screen.getByText('Are you currently a resident of Richmond, Virginia?')).toBeInTheDocument();
    });
  });

  test('handles richmond resident question', async () => {
    render(<App />);

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading chatbot...')).not.toBeInTheDocument();
    });

    // Answer the eviction question
    await waitFor(() => {
      expect(screen.getByText('Do you currently have an active eviction case filed against you in Richmond?')).toBeInTheDocument();
    });
    const yesButton = screen.getByRole('button', { name: /Yes, I have an eviction case/i });
    fireEvent.click(yesButton);

    // Answer the richmond resident question
    await waitFor(() => {
      expect(screen.getByText('Are you currently a resident of Richmond, Virginia?')).toBeInTheDocument();
    });
    const yesResidentButton = screen.getByRole('button', { name: /Yes, I live in Richmond/i });
    fireEvent.click(yesResidentButton);

    await waitFor(() => {
      expect(screen.getByText('What is your household income level? The program serves households at or below 80% of the Area Median Income (AMI).')).toBeInTheDocument();
    });
  });

  test('handles income level question', async () => {
    render(<App />);

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading chatbot...')).not.toBeInTheDocument();
    });

    // Answer the eviction question
    await waitFor(() => {
      expect(screen.getByText('Do you currently have an active eviction case filed against you in Richmond?')).toBeInTheDocument();
    });
    const yesButton = screen.getByRole('button', { name: /Yes, I have an eviction case/i });
    fireEvent.click(yesButton);

    // Answer the richmond resident question
    await waitFor(() => {
      expect(screen.getByText('Are you currently a resident of Richmond, Virginia?')).toBeInTheDocument();
    });
    const yesResidentButton = screen.getByRole('button', { name: /Yes, I live in Richmond/i });
    fireEvent.click(yesResidentButton);

    // Answer the income level question
    await waitFor(() => {
      expect(screen.getByText('What is your household income level? The program serves households at or below 80% of the Area Median Income (AMI).')).toBeInTheDocument();
    });
    const below80Button = screen.getByRole('button', { name: /At or below 80% AMI/i });
    fireEvent.click(below80Button);

    await waitFor(() => {
      expect(screen.getByText('Do you currently have legal representation for your eviction case?')).toBeInTheDocument();
    });
  });
});
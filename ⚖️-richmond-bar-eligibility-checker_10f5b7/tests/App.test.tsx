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


beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers(); // Enable fake timers
});

afterEach(() => {
  jest.runOnlyPendingTimers(); // Execute any pending timers
  jest.useRealTimers(); // Restore real timers
});


describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
  });

  it('displays loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading chatbot...')).toBeInTheDocument();
  });

  it('starts a new session and displays the greeting message', async () => {
    render(<App />);

    // Wait for the loading message to disappear and the first bot message to appear
    await waitFor(() => screen.getByText('Hello! I\'m here to help you check your eligibility for the Richmond Bar Foundation\'s Eviction Diversion Program. This program provides free legal assistance to tenants facing eviction. Let\'s get started with a few questions.')
    , {timeout: 3000});

    // Verify the first question is asked
    await waitFor(() => {
        expect(screen.getByText('Do you currently have an active eviction case filed against you in Richmond?')).toBeInTheDocument();
    }, {timeout: 3000});
  });

  it('navigates through the questions and shows eligibility result when eligible', async () => {
    render(<App />);

    // Wait for the first question to appear
    await waitFor(() => screen.getByText('Do you currently have an active eviction case filed against you in Richmond?'), { timeout: 3000 });

    // Answer the first question
    fireEvent.click(screen.getByRole('button', { name: /Yes, I have an eviction case/i }));
    await waitFor(() => screen.getByText('Are you currently a resident of Richmond, Virginia?'), { timeout: 3000 });

    // Answer the second question
    fireEvent.click(screen.getByRole('button', { name: /Yes, I live in Richmond/i }));
    await waitFor(() => screen.getByText('What is your household income level? The program serves households at or below 80% of the Area Median Income (AMI).'), { timeout: 3000 });

    // Answer the third question
    fireEvent.click(screen.getByRole('button', { name: /My income is at or below 80% AMI/i }));
    await waitFor(() => screen.getByText('Do you currently have legal representation for your eviction case?'), { timeout: 3000 });

    // Answer the fourth question
    fireEvent.click(screen.getByRole('button', { name: /No, I need legal help/i }));
    await waitFor(() => screen.getByText('Is your eviction case still active and ongoing?'), { timeout: 3000 });

    // Answer the fifth question
    fireEvent.click(screen.getByRole('button', { name: /Yes, case is active/i }));

    // Wait for the eligibility result message to appear
    await waitFor(() => screen.getByText('Great news! Based on your responses, you appear to be eligible for the Richmond Bar Foundation\'s Eviction Diversion Program. Here\'s what you need to know about next steps.'), { timeout: 5000 });
  });

  it('navigates through the questions and shows resources when not eligible', async () => {
    render(<App />);

    // Wait for the first question to appear
    await waitFor(() => screen.getByText('Do you currently have an active eviction case filed against you in Richmond?'), { timeout: 3000 });

    // Answer the first question
    fireEvent.click(screen.getByRole('button', { name: /No, I don't have one/i }));

    // Wait for the eligibility result message to appear
    await waitFor(() => screen.getByText('I understand you don\'t currently have an eviction case. The Eviction Diversion Program is specifically designed for tenants with active eviction cases. However, you may still benefit from other legal resources.'), { timeout: 5000 });
  });

  it('starts a new chat when the New Chat button is clicked', async () => {
    render(<App />);

    // Wait for the component to load and the first question to appear
    await waitFor(() => screen.getByText('Do you currently have an active eviction case filed against you in Richmond?'), { timeout: 3000 });

    // Click the New Chat button
    fireEvent.click(screen.getByRole('button', { name: /New Chat/i }));

    // Verify that the chat has been reset and the greeting message is displayed again
     await waitFor(() => screen.getByText('Hello! I\'m here to help you check your eligibility for the Richmond Bar Foundation\'s Eviction Diversion Program. This program provides free legal assistance to tenants facing eviction. Let\'s get started with a few questions.')
    , {timeout: 3000});
  });
});
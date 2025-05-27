import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock the AILayer component
jest.mock('../src/components/AILayer', () => {
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        sendToAI: (message: string) => {
          props.onResult && props.onResult("Mock AI Response");
          props.onLoading && props.onLoading(false);
          return Promise.resolve();
        },
      }));

      return <div data-testid="ai-layer-mock">AILayer Mock</div>;
    }),
  };
});

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

beforeEach(() => {
  localStorageMock.clear();
});


describe('App Component', () => {
  test('renders navigation and home page by default', () => {
    render(<App />);
    expect(screen.getByText('Richmond Bar Foundation')).toBeInTheDocument();
    expect(screen.getByText('Eviction Diversion Program')).toBeInTheDocument();
    expect(screen.getByText("Free legal assistance for Richmond tenants facing eviction. Get help with mediation, payment plans, and legal representation.")).toBeInTheDocument();
  });

  test('navigation menu button navigates to chat page', async () => {
    render(<App />);
    const checkEligibilityButton = screen.getByRole('button', {name: /check your eligibility/i});
    fireEvent.click(checkEligibilityButton);

    await waitFor(() => {
      expect(screen.getByText('Eligibility Assistant')).toBeInTheDocument();
    });
  });

  test('sends message and displays bot response', async () => {
    render(<App />);

    // Navigate to chat page
    const checkEligibilityButton = screen.getByRole('button', {name: /check your eligibility/i});
    fireEvent.click(checkEligibilityButton);

    const userInput = 'I need help with eviction';
    const chatInput = screen.getByPlaceholderText('Describe your situation or ask about eligibility...');
    fireEvent.change(chatInput, { target: { value: userInput } });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Mock AI Response')).toBeInTheDocument();
    });

  });

  test('clears all data when clear data button is clicked', async () => {
    render(<App />);

    // Navigate to settings page
    const settingsButton = screen.getByRole('button', {name: /settings/i});
    fireEvent.click(settingsButton);

    // Clear data
    const clearDataButton = screen.getByRole('button', { name: /clear data/i });
    fireEvent.click(clearDataButton);

    await waitFor(() => {
      expect(screen.getByText("Hello! I'm here to help you check your eligibility for the Richmond Bar Foundation's Eviction Diversion Program. This program provides free legal assistance to qualifying tenants facing eviction. May I ask about your current situation?")).toBeInTheDocument();
    });

  });

  test('toggles dark mode', async () => {
    render(<App />);

    // Navigate to settings page
    const settingsButton = screen.getByRole('button', {name: /settings/i});
    fireEvent.click(settingsButton);

    const darkModeToggle = screen.getByRole('button');
    fireEvent.click(darkModeToggle);

    expect(localStorageMock.getItem('darkMode')).toBe('true');

    fireEvent.click(darkModeToggle);
    expect(localStorageMock.getItem('darkMode')).toBe('false');
  });
});
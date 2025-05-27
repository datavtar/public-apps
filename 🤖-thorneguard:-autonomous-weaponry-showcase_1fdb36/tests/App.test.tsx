import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the auth context
const mockAuthContextValue = {
  currentUser: null,
  login: jest.fn(),
  logout: jest.fn(),
};


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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });


// Mock the AILayer component
jest.mock('../src/components/AILayer', () => {
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      // Mock the sendToAI function and other functionalities as needed
      React.useImperativeHandle(ref, () => ({
        sendToAI: jest.fn().mockImplementation((prompt: string, file?: File) => {
          if (props.onResult) {
            props.onResult(JSON.stringify({analysis: 'Mock AI analysis'}));
          }
        }),
      }));

      return (
        <div data-testid="ailayer-mock">
          Mock AILayer
        </div>
      );
    }),
  };
});


describe('App Component', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the App component', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByText(/ThorneGuard/i)).toBeInTheDocument();
  });

  test('Navigation links should be present', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Products/i)).toBeInTheDocument();
    expect(screen.getByText(/Technology/i)).toBeInTheDocument();
    expect(screen.getByText(/Company/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact/i)).toBeInTheDocument();
  });

  test('Mobile menu opens and closes', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    const menuButton = screen.getByRole('button', { name: /Menu/i });
    fireEvent.click(menuButton);
    expect(screen.getByText(/Home/i)).toBeVisible();

    const closeButton = screen.getByRole('button', { name: /Menu/i });
    fireEvent.click(closeButton);

  });

  test('Settings panel toggles visibility', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    const settingsButton = screen.getByRole('button', { name: /Settings/i });
    fireEvent.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByText(/Settings/i)).toBeVisible();
    });

    const closeSettingsButton = screen.getByRole('button');
    fireEvent.click(closeSettingsButton);

  });

  test('Contact form submission', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText(/Contact/i))

    const nameInput = screen.getByLabelText(/Full Name/i);
    const organizationInput = screen.getByLabelText(/Organization/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const subjectInput = screen.getByLabelText(/Subject/i);
    const messageInput = screen.getByLabelText(/Message/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(organizationInput, { target: { value: 'Acme Corp' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(subjectInput, { target: { value: 'Inquiry' } });
    fireEvent.change(messageInput, { target: { value: 'Details about product' } });

    fireEvent.click(screen.getByRole('button', { name: /Send Secure Message/i }));


  });

  test('AI analysis with prompt', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText(/AI Analysis/i))

    const promptInput = screen.getByLabelText(/Analysis Prompt/i);
    fireEvent.change(promptInput, { target: { value: 'Analyze this text' } });

    const analyzeButton = screen.getByRole('button', { name: /Analyze with AI/i });
    fireEvent.click(analyzeButton);

  });

  test('AI analysis history displays', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText(/AI Analysis/i))
    const promptInput = screen.getByLabelText(/Analysis Prompt/i);
    fireEvent.change(promptInput, { target: { value: 'Analyze this text' } });

    const analyzeButton = screen.getByRole('button', { name: /Analyze with AI/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
        expect(screen.getByText(/Mock AI analysis/i)).toBeVisible();
      });
  });
});
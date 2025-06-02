import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the auth context
const mockAuthContextValue = {
  currentUser: {
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser'
  },
  logout: jest.fn(),
  signup: jest.fn(),
  login: jest.fn(),
};

// Mock the AILayer component
jest.mock('../src/components/AILayer', () => {
  return {
    __esModule: true,
    default: React.forwardRef((props, ref) => {
      return (
        <div data-testid="ai-layer">
          <button onClick={() => {
            if (ref && typeof ref === 'object' && ref !== null && 'current' in ref && ref.current) {
              // Simulate a successful AI response
              (ref.current as any).sendToAI = jest.fn().mockImplementation(() => {
                props.onResult('Mock AI Response');
                props.onLoading(false);
              });
            }
          }}>Simulate AI Success</button>
          <button onClick={() => {
            if (ref && typeof ref === 'object' && ref !== null && 'current' in ref && ref.current) {
              // Simulate an AI error
              (ref.current as any).sendToAI = jest.fn().mockImplementation(() => {
                props.onError('Mock AI Error');
                props.onLoading(false);
              });
            }
          }}>Simulate AI Error</button>
          <button onClick={() => props.onLoading(true)}>Simulate AI Loading</button>
        </div>
      );
    })
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );
    expect(screen.getByText(/Hello, Test!/i)).toBeInTheDocument();
  });

  test('handles recording, processing, and idle states', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    const recordButton = screen.getByRole('button', {name: /^mic$/i});

    // Initial state: Ready to record
    expect(screen.getByText(/Ready to record/i)).toBeInTheDocument();

    // Start recording
    fireEvent.click(recordButton);
    await waitFor(() => {
      expect(screen.getByText(/Recording\.\.\./i)).toBeInTheDocument();
    });

    // Stop recording (simulate by clicking again)
    fireEvent.click(recordButton);
    await waitFor(() => {
      expect(screen.getByText(/Processing with AI\.\.\./i)).toBeInTheDocument();
    });

    // Simulate AI success.  Find the AILayer mock and click success.
    const aiLayer = screen.getByTestId('ai-layer');
    fireEvent.click(within(aiLayer).getByText(/Simulate AI Success/i));

    await waitFor(() => {
      expect(screen.getByText(/Latest Response:/i)).toBeInTheDocument();
      expect(screen.getByText(/Mock AI Response/i)).toBeInTheDocument();
    });
  });

  test('handles AI error state', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    const recordButton = screen.getByRole('button', {name: /^mic$/i});

    // Start recording
    fireEvent.click(recordButton);
    // Stop recording
    fireEvent.click(recordButton);

    // Simulate AI error
    const aiLayer = screen.getByTestId('ai-layer');
    fireEvent.click(within(aiLayer).getByText(/Simulate AI Error/i));

    await waitFor(() => {
      expect(screen.getByText(/Error occurred/i)).toBeInTheDocument();
      expect(screen.getByText(/Mock AI Error/i)).toBeInTheDocument();
    });
  });

  test('handles AI loading state', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    const recordButton = screen.getByRole('button', {name: /^mic$/i});

    // Start recording
    fireEvent.click(recordButton);
    // Stop recording
    fireEvent.click(recordButton);

    // Simulate AI loading
    const aiLayer = screen.getByTestId('ai-layer');
    fireEvent.click(within(aiLayer).getByText(/Simulate AI Loading/i));

    await waitFor(() => {
        // Check the spinner is present, implying the loading state
        const spinnerElement = document.querySelector('.spinner');
        expect(spinnerElement).toBeInTheDocument();
    });

  });

  test('navigates to settings page and updates settings', async () => {
    render(
        <AuthContext.Provider value={mockAuthContextValue}>
            <App />
        </AuthContext.Provider>
    );

    // Navigate to settings page
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));

    // Check if settings page is rendered
    expect(screen.getByText(/Audio Settings/i)).toBeInTheDocument();

    // Change voice speed
    const voiceSpeedInput = screen.getByLabelText(/Voice Speed/i) as HTMLInputElement;
    fireEvent.change(voiceSpeedInput, { target: { value: '1.5' } });
    expect(voiceSpeedInput.value).toBe('1.5');

    // Change theme
    const themeSelect = screen.getByLabelText(/Theme/i) as HTMLSelectElement;
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    expect(themeSelect.value).toBe('dark');

        // Navigate back to main page
        fireEvent.click(screen.getByRole('button', { name: /← Back/i }));
        expect(screen.getByText(/Hello, Test!/i)).toBeInTheDocument();


  });



  test('navigates to history page and sees no conversations', async () => {
    render(
        <AuthContext.Provider value={mockAuthContextValue}>
            <App />
        </AuthContext.Provider>
    );

    // Navigate to history page
    fireEvent.click(screen.getByRole('button', { name: /history/i }));

    // Check if history page is rendered
    expect(screen.getByText(/Conversation History/i)).toBeInTheDocument();

    //Check message on page
    expect(screen.getByText(/No conversations yet/i)).toBeInTheDocument();
  });

});

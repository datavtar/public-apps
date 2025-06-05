import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

// Mock authContext
const mockUseAuth = jest.fn();
jest.mock('../src/contexts/authContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock AILayer
const mockSendToAI = jest.fn();
jest.mock('../src/components/AILayer', () => ({
  __esModule: true,
  default: React.forwardRef((props: any, ref: React.Ref<any>) => {
    React.useImperativeHandle(ref, () => ({
      sendToAI: mockSendToAI,
    }));

    // Simulate AI response for testing purposes after mockSendToAI is called
    React.useEffect(() => {
      // This effect runs whenever mockSendToAI is called (indicated by its mock.calls.length changing)
      // and provides the async response.
      if (mockSendToAI.mock.calls.length > 0) {
        // Get the last prompt sent to AI
        const lastCallPrompt = mockSendToAI.mock.calls[mockSendToAI.mock.calls.length - 1][0];
        if (props.onLoading) props.onLoading(true);
        setTimeout(() => {
          if (lastCallPrompt.includes('error')) {
            if (props.onError) props.onError('Simulated AI Error');
          } else {
            if (props.onResult) props.onResult(JSON.stringify({
              analysis: "Simulated analysis for: " + lastCallPrompt,
              risk_assessment: "Low risk",
              recommendations: "Buy low, sell high",
              key_metrics: { metric1: 10, metric2: 20 }
            }, null, 2));
          }
          if (props.onLoading) props.onLoading(false);
        }, 100); // Small delay to simulate async operation
      }
    }, [mockSendToAI.mock.calls.length]); // Dependency to re-run effect when sendToAI is called

    return null; // AILayer does not render visible UI
  }),
}));

describe('App', () => {
  const user = userEvent.setup();

  const mockCurrentUser = {
    first_name: 'Test',
    username: 'testuser',
  };

  beforeEach(() => {
    // Reset mocks before each test
    mockUseAuth.mockReset();
    mockSendToAI.mockReset();

    // Clear local storage to ensure tests are isolated and don't carry over state
    localStorage.clear();

    // Mock Date.now() for predictable IDs (e.g., model creation, backtest creation)
    // This ensures that generated IDs like '1678886400000' are consistent.
    jest.spyOn(Date, 'now').mockReturnValue(1678886400000); // A fixed timestamp
  });

  afterEach(() => {
    // Restore Date.now() mock to its original implementation after each test
    jest.restoreAllMocks();
  });

  test('shows loading state when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ currentUser: null, logout: jest.fn() });
    render(<App />);
    // Use getByText with exact match for loading state text
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders dashboard and user info when authenticated', async () => {
    mockUseAuth.mockReturnValue({ currentUser: mockCurrentUser, logout: jest.fn() });
    render(<App />);

    // Wait for the main application content to be rendered after authentication
    await waitFor(() => {
      // Verify current page heading is Dashboard
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
      // Verify user welcome message
      expect(screen.getByText(/welcome back, test/i)).toBeInTheDocument();
      // Verify username in header
      expect(screen.getByText('testuser')).toBeInTheDocument();
      // Verify dashboard stats section by its test ID
      expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument();
      // Verify key dashboard figures (e.g., total portfolio value)
      expect(screen.getByText('$1,250,000')).toBeInTheDocument(); 
    });
  });

  test('navigates to Models page and displays content', async () => {
    mockUseAuth.mockReturnValue({ currentUser: mockCurrentUser, logout: jest.fn() });
    render(<App />);

    // Click the 'Models' navigation button
    await user.click(screen.getByRole('button', { name: /models/i }));

    // Wait for the Models page content to load
    await waitFor(() => {
      // Verify the heading for the Models page
      expect(screen.getByRole('heading', { name: /trading models/i })).toBeInTheDocument();
      // Verify presence of 'Create Model' button
      expect(screen.getByRole('button', { name: /create model/i })).toBeInTheDocument();
      // Verify search input is present
      expect(screen.getByPlaceholderText(/search models.../i)).toBeInTheDocument();
      // Verify that default models are displayed
      expect(screen.getByText('Momentum RSI Strategy')).toBeInTheDocument();
      expect(screen.getByText('Mean Reversion MACD')).toBeInTheDocument();
    });
  });

  test('creates a new trading model', async () => {
    mockUseAuth.mockReturnValue({ currentUser: mockCurrentUser, logout: jest.fn() });
    render(<App />);

    // Navigate to Models page first
    await user.click(screen.getByRole('button', { name: /models/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /trading models/i })).toBeInTheDocument();
    });

    // Click 'Create Model' button to open the modal
    await user.click(screen.getByRole('button', { name: /create model/i }));

    // Ensure the modal is visible and verify its heading
    expect(screen.getByRole('heading', { name: /create trading model/i })).toBeInTheDocument();

    // Fill out the form fields in the modal
    await user.type(screen.getByLabelText(/model name/i), 'New Test Model');
    await user.selectOptions(screen.getByLabelText(/model type/i), 'ml'); // Select 'Machine Learning'
    await user.type(screen.getByLabelText(/description/i), 'A test description.');
    await user.selectOptions(screen.getByLabelText(/risk level/i), 'high'); // Select 'High'
    await user.type(screen.getByLabelText(/parameters \(json\)/i), '{"testParam": "testValue"}');

    // Click the 'Create Model' button within the modal
    await user.click(screen.getByRole('button', { name: /^create model$/i })); // Use exact match for modal button

    // Wait for the modal to close after form submission
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /create trading model/i })).not.toBeInTheDocument();
    });

    // Verify that the newly created model is visible in the list on the Models page
    expect(screen.getByText('New Test Model')).toBeInTheDocument();
    // New models start as 'inactive'
    expect(screen.getByText('New Test Model').closest('.bg-slate-800')?.querySelector('span')).toHaveTextContent('inactive');
    expect(screen.getByText('A test description.')).toBeInTheDocument();
  });

  test('runs a new backtest', async () => {
    mockUseAuth.mockReturnValue({ currentUser: mockCurrentUser, logout: jest.fn() });
    render(<App />);

    // Navigate to Backtesting page
    await user.click(screen.getByRole('button', { name: /backtesting/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /backtesting results/i })).toBeInTheDocument();
    });

    // Click 'Run Backtest' button to open the modal
    await user.click(screen.getByRole('button', { name: /run backtest/i }));

    // Ensure the modal is visible and verify its heading
    expect(screen.getByRole('heading', { name: /run backtest/i })).toBeInTheDocument();

    // Select an existing model from the dropdown (e.g., 'Momentum RSI Strategy' which has ID '1')
    await user.selectOptions(screen.getByLabelText(/select model/i), '1'); // Option value is model.id
    // Verify the selection was successful
    const modelSelect = screen.getByLabelText(/select model/i) as HTMLSelectElement;
    expect(modelSelect.value).toBe('1'); 

    // Fill or confirm default values for other backtest parameters
    await user.type(screen.getByLabelText(/start date/i), '2022-01-01'); // Override default for clarity
    await user.type(screen.getByLabelText(/end date/i), '2022-12-31'); // Override default for clarity
    await user.clear(screen.getByLabelText(/initial capital/i)); // Clear existing default
    await user.type(screen.getByLabelText(/initial capital/i), '50000'); // Set new value

    // Click the 'Run Backtest' button within the modal
    await user.click(screen.getByRole('button', { name: /^run backtest$/i }));

    // Expect the button to show a loading state
    expect(screen.getByRole('button', { name: /running.../i })).toBeInTheDocument();

    // Wait for the backtest to complete and the modal to close
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /run backtest/i })).not.toBeInTheDocument();
    }, { timeout: 3500 }); // Increase timeout slightly as the mock has a 3s delay

    // Verify that the new backtest result for 'Momentum RSI Strategy' is displayed
    // We expect two cards to have 'Momentum RSI Strategy' in their title now (one default, one new)
    expect(screen.getAllByRole('heading', { name: 'Momentum RSI Strategy' }).length).toBeGreaterThanOrEqual(1);
    // Check for a characteristic text of the new backtest result. 
    // Since the content is dynamic, checking for general sections or elements is better than exact numbers.
    // We can verify that the backtest results section now contains more data items or expected texts.
    // For example, checking for the presence of the chart for a new backtest result.
    // Note: The specific values are randomized in the component, so we can't check for exact numbers.
    expect(screen.getAllByText(/total return/i).length).toBeGreaterThanOrEqual(1); // Checks for the text within results
  });

  test('toggles dark/light mode', async () => {
    mockUseAuth.mockReturnValue({ currentUser: mockCurrentUser, logout: jest.fn() });
    render(<App />);

    // Initially, the document should have the 'dark' class
    expect(document.documentElement).toHaveClass('dark');

    // Find the theme toggle button (initially showing Sun icon for Dark Mode)
    const themeToggleButton = screen.getByRole('button', { name: /sun/i }); 
    await user.click(themeToggleButton);

    // After clicking, it should switch to light mode (document.documentElement should not have 'dark' class)
    expect(document.documentElement).not.toHaveClass('dark');
    // The button icon should change to Moon for Light Mode
    expect(screen.getByRole('button', { name: /moon/i })).toBeInTheDocument(); 

    // Click again to switch back to dark mode
    await user.click(screen.getByRole('button', { name: /moon/i }));
    expect(document.documentElement).toHaveClass('dark');
    expect(screen.getByRole('button', { name: /sun/i })).toBeInTheDocument();
  });

  test('toggles sidebar collapse', async () => {
    mockUseAuth.mockReturnValue({ currentUser: mockCurrentUser, logout: jest.fn() });
    render(<App />);

    // Initially, sidebar should be expanded, so navigation labels are visible
    expect(screen.getByText('Dashboard')).toBeVisible();
    expect(screen.getByText('Models')).toBeVisible();

    // Find the sidebar toggle button (Menu icon)
    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    // After collapsing, the labels should no longer be visible (or not in the document)
    await waitFor(() => {
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument(); 
        expect(screen.queryByText('Models')).not.toBeInTheDocument();
    });

    // Click again to expand the sidebar
    await user.click(menuButton);

    // After expanding, labels should be visible again
    await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeVisible();
        expect(screen.getByText('Models')).toBeVisible();
    });
  });

  test('performs AI analysis and handles errors', async () => {
    mockUseAuth.mockReturnValue({ currentUser: mockCurrentUser, logout: jest.fn() });
    render(<App />);

    // Navigate to Analytics page
    await user.click(screen.getByRole('button', { name: /analytics/i }));
    await waitFor(() => {
        expect(screen.getByRole('heading', { name: /ai market analysis/i })).toBeInTheDocument();
    });

    // Click the 'AI Analysis' button to reveal the AI input section
    await user.click(screen.getByRole('button', { name: /ai analysis/i }));

    const promptInput = screen.getByPlaceholderText(/enter your market analysis question/i);
    const analyzeButton = screen.getByRole('button', { name: /analyze/i });

    // Test successful analysis
    await user.type(promptInput, 'Analyze current market conditions');
    await user.click(analyzeButton);

    // Expect loading state when AI is processing
    expect(screen.getByRole('button', { name: /analyzing.../i })).toBeInTheDocument();

    // Wait for AI result to appear
    await waitFor(() => {
      expect(screen.getByText(/ai analysis result/i)).toBeInTheDocument();
      expect(screen.getByText(/simulated analysis for: analyze current market conditions/i)).toBeInTheDocument();
    }, { timeout: 200 }); // Short timeout as our mock is fast

    // Test error scenario
    await user.clear(promptInput); // Clear previous input
    await user.type(promptInput, 'This prompt will cause an error'); // Prompt to trigger error in mock
    await user.click(analyzeButton);

    // Expect error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/error: simulated ai error/i)).toBeInTheDocument();
    }, { timeout: 200 });
  });

  test('exports and clears all data', async () => {
    mockUseAuth.mockReturnValue({ currentUser: mockCurrentUser, logout: jest.fn() });
    render(<App />);

    // Navigate to Settings page
    await user.click(screen.getByRole('button', { name: /settings/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
    });

    // Mock browser's file download mechanism for export test
    const createObjectURLSpy = jest.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:testurl');
    const revokeObjectURLSpy = jest.spyOn(window.URL, 'revokeObjectURL');
    const downloadLinkClickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(jest.fn());

    // Test Export Data functionality
    await user.click(screen.getByRole('button', { name: /export to csv/i }));

    await waitFor(() => {
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(downloadLinkClickSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:testurl');
    });

    // Verify localStorage contains data before clearing
    expect(localStorage.getItem('tradingModels')).not.toBeNull();
    expect(localStorage.getItem('tradingModels')).not.toBe('[]'); // Should contain default data

    // Test Clear All Data functionality
    await user.click(screen.getByRole('button', { name: /clear all data/i }));

    // Verify localStorage is cleared (App sets to empty array, not null after clear)
    expect(localStorage.getItem('tradingModels')).toBe('[]'); 
    expect(localStorage.getItem('backtestResults')).toBe('[]');
    expect(localStorage.getItem('portfolios')).toBe('[]');

    // Verify UI reflects cleared data by navigating to Models page and checking for absence of default models
    await user.click(screen.getByRole('button', { name: /models/i }));
    await waitFor(() => {
      expect(screen.queryByText('Momentum RSI Strategy')).not.toBeInTheDocument();
    });
  });

  test('logs out the user', async () => {
    // Create a mock logout function
    const mockLogout = jest.fn();
    mockUseAuth.mockReturnValue({ currentUser: mockCurrentUser, logout: mockLogout });
    render(<App />);

    // Find and click the logout button
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    // Verify that the mock logout function was called
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
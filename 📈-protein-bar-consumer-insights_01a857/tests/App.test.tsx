import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { useAuth } from '../src/contexts/authContext';
import AILayer from '../src/components/AILayer';

// Mock the auth context
jest.mock('../src/contexts/authContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the AILayer component
jest.mock('../src/components/AILayer', () => {
  // Use forwardRef in the mock to allow ref to be passed
  const MockAILayer = React.forwardRef<any, any>(
    ({ prompt, attachment, onResult, onError, onLoading }, ref) => {
      React.useImperativeHandle(ref, () => ({
        sendToAI: jest.fn((text: string, file?: File) => {
          onLoading(true);
          // Simulate API call
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              if (text.includes('error')) {
                onError(new Error('Simulated AI Error Object')); // Pass an error object to trigger generic message
              } else {
                onResult("AI result for: \"" + text + "\" with file: " + (file ? file.name : 'none'));
              }
              onLoading(false);
              resolve();
            }, 100); // Simulate network delay
          });
        }),
      }));
      return React.createElement("div", { "data-testid": "ai-layer-mock" }, "AI Layer Mock");
    }
  );
  return MockAILayer;
});

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
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

// Mock URL.createObjectURL and URL.revokeObjectURL for file export/import
const mockUrlCreateObjectURL = jest.fn(() => 'blob:mock-url');
const mockUrlRevokeObjectURL = jest.fn();
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: mockUrlCreateObjectURL,
    revokeObjectURL: mockUrlRevokeObjectURL,
  },
});

// Mock FileReader for file import
class MockFileReader {
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  result: string | ArrayBuffer | null = null;
  readAsText = jest.fn((file: Blob) => {
    // Simulate reading file content based on file name or a default
    // This content will be parsed by the component's import handler
    this.result = JSON.stringify({
      consumers: [{ "id": "imported-1", "name": "Imported Consumer", "age": 30, "gender": "Female" }],
      marketData: [{ "id": "imported-md1", "category": "Imported", "value": 100 }],
      competitors: [{ "id": "imported-comp1", "brand": "Imported Brand", "productName": "Imported Product", "price": 10, "protein": 10, "calories": 100, "flavors": [], "targetAudience": "Any", "marketShare": 1, "rating": 1, "launchDate": "2023-01-01" }],
      surveys: [{ "id": "imported-s1", "respondentId": "1", "question": "Imported Q", "answer": "Imported A", "rating": 5, "date": "2023-01-01", "category": "cat" }],
    });
    if (this.onload) {
      this.onload(new ProgressEvent('load'));
    }
  });
}
Object.defineProperty(window, 'FileReader', {
  value: MockFileReader,
});

describe('App', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { username: 'testuser', first_name: 'Test', last_name: 'User' },
      logout: jest.fn(),
    });
    localStorageMock.clear();
    mockUrlCreateObjectURL.mockClear();
    mockUrlRevokeObjectURL.mockClear();
    jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original functions after each test
  });

  // Test 1: Basic rendering
  test('renders the application with default dashboard view', () => {
    render(React.createElement(App, null));
    // Check for header elements
    expect(screen.getByRole('heading', { name: /Protein Bar Research/i })).toBeInTheDocument();
    expect(screen.getByText(/Consumer Insights Dashboard/i)).toBeInTheDocument();
    // Check for user info in header
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();

    // Check if dashboard view is rendered by default
    expect(screen.getByRole('heading', { name: /Protein Bar Consumer Research Dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/Total Consumers/i)).toBeInTheDocument();
    expect(screen.getByText(/Market Size/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Surveys/i)).toBeInTheDocument();
    expect(screen.getByText(/Competitors Tracked/i)).toBeInTheDocument();
  });

  // Test 2: Navigation
  test('navigates between different views', async () => {
    render(React.createElement(App, null));
    const user = userEvent.setup();

    // Navigate to Consumers
    await user.click(screen.getByRole('button', { name: /Consumers/i }));
    expect(screen.getByRole('heading', { name: /Consumer Profiles/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Protein Bar Consumer Research Dashboard/i })).not.toBeInTheDocument(); // Dashboard should not be visible

    // Navigate to Competitors
    await user.click(screen.getByRole('button', { name: /Competitors/i }));
    expect(screen.getByRole('heading', { name: /Competitor Analysis/i })).toBeInTheDocument();

    // Navigate to Surveys
    await user.click(screen.getByRole('button', { name: /Surveys/i }));
    expect(screen.getByRole('heading', { name: /Survey Insights/i })).toBeInTheDocument();

    // Navigate to AI Insights
    await user.click(screen.getByRole('button', { name: /AI Insights/i }));
    expect(screen.getByRole('heading', { name: /AI-Powered Insights/i })).toBeInTheDocument();

    // Navigate to Settings
    await user.click(screen.getByRole('button', { name: /Settings/i }));
    expect(screen.getByRole('heading', { name: /Settings/i })).toBeInTheDocument();

    // Navigate back to Dashboard
    await user.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByRole('heading', { name: /Protein Bar Consumer Research Dashboard/i })).toBeInTheDocument();
  });

  // Test 3: Logout functionality
  test('logs out the user when logout button is clicked', async () => {
    const logoutMock = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { username: 'testuser' },
      logout: logoutMock,
    });
    render(React.createElement(App, null));
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Logout/i }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  // Test 4: Add New Consumer
  test('allows adding a new consumer', async () => {
    render(React.createElement(App, null));
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Consumers/i }));
    await user.click(screen.getByRole('button', { name: /Add Consumer/i }));

    // Expect modal to be open
    expect(screen.getByRole('heading', { name: /Add New Consumer/i })).toBeInTheDocument();

    // Fill form fields
    await user.type(screen.getByLabelText(/Name \*/i), 'New Test Consumer');
    await user.type(screen.getByLabelText(/Age \*/i), '30');
    await user.selectOptions(screen.getByLabelText(/Gender/i), 'Female');
    await user.selectOptions(screen.getByLabelText(/Income Range/i), '$50,000-$75,000');
    await user.type(screen.getByLabelText(/Lifestyle/i), 'Active Student');
    await user.selectOptions(screen.getByLabelText(/Fitness Level/i), 'Medium');

    await user.click(screen.getByRole('button', { name: /Add Consumer/i }));

    // Modal should close and new consumer should be visible
    expect(screen.queryByRole('heading', { name: /Add New Consumer/i })).not.toBeInTheDocument();
    expect(screen.getByText('New Test Consumer')).toBeInTheDocument();
    expect(screen.getByText(/Active Student/i)).toBeInTheDocument();
  });

  // Test 5: Delete Consumer
  test('allows deleting a consumer', async () => {
    render(React.createElement(App, null));
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Consumers/i }));

    // Find a consumer to delete, e.g., 'Sarah Johnson' (from initial data)
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();

    // Click delete button for Sarah Johnson
    // Since there are multiple trash icons and no unique test IDs provided, we find the specific button via its parent card.
    const sarahCard = screen.getByText('Sarah Johnson').closest('.card');
    expect(sarahCard).toBeInTheDocument();
    const deleteButton = sarahCard?.querySelector('button:has(svg.lucide-trash-2)'); // Targeting the button by its child SVG icon
    if (deleteButton) {
      await user.click(deleteButton);
    } else {
        throw new Error("Delete button not found for Sarah Johnson");
    }

    // Verify Sarah Johnson is no longer in the document
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument();
  });

  // Test 6: Search Consumer
  test('filters consumers by search term', async () => {
    render(React.createElement(App, null));
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Consumers/i }));

    // Initial state: all consumers are visible
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Mike Thompson')).toBeInTheDocument();
    expect(screen.getByText('Emily Chen')).toBeInTheDocument();

    // Type into search box
    await user.type(screen.getByPlaceholderText(/Search consumers\.\.\./i), 'sarah');

    // Only Sarah Johnson should be visible
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Mike Thompson')).not.toBeInTheDocument();
    expect(screen.queryByText('Emily Chen')).not.toBeInTheDocument();

    // Clear search and type something else
    await user.clear(screen.getByPlaceholderText(/Search consumers\.\.\./i));
    await user.type(screen.getByPlaceholderText(/Search consumers\.\.\./i), 'mike');

    // Only Mike Thompson should be visible
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument();
    expect(screen.getByText('Mike Thompson')).toBeInTheDocument();
    expect(screen.queryByText('Emily Chen')).not.toBeInTheDocument();
  });

  // Test 7: Filter Consumer
  test('filters consumers by fitness level', async () => {
    render(React.createElement(App, null));
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Consumers/i }));

    // Initial state: all consumers are visible
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument(); // High
    expect(screen.getByText('Mike Thompson')).toBeInTheDocument(); // Very High
    expect(screen.getByText('Emily Chen')).toBeInTheDocument(); // Medium

    // Select 'High' fitness level
    await user.selectOptions(screen.getByRole('combobox', { name: /All Fitness Levels/i }), 'High');

    // Only Sarah Johnson should be visible
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Mike Thompson')).not.toBeInTheDocument();
    expect(screen.queryByText('Emily Chen')).not.toBeInTheDocument();

    // Select 'Medium' fitness level
    await user.selectOptions(screen.getByRole('combobox', { name: /All Fitness Levels/i }), 'Medium');

    // Only Emily Chen should be visible
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument();
    expect(screen.queryByText('Mike Thompson')).not.toBeInTheDocument();
    expect(screen.getByText('Emily Chen')).toBeInTheDocument();
  });

  // Test 8: View Consumer/Competitor Details Modal
  test('opens and displays details in view-details modal for a consumer', async () => {
    render(React.createElement(App, null));
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Consumers/i }));

    // Click 'View' button for Sarah Johnson
    // Since there are multiple eye icons and no unique test IDs provided, we find the specific button via its parent card.
    const sarahCard = screen.getByText('Sarah Johnson').closest('.card');
    expect(sarahCard).toBeInTheDocument();
    const viewButton = sarahCard?.querySelector('button:has(svg.lucide-eye)'); // Targeting the button by its child SVG icon
    if (viewButton) {
      await user.click(viewButton);
    } else {
      throw new Error("View button not found for Sarah Johnson");
    }

    // Modal should be open with Sarah's details
    expect(screen.getByRole('heading', { name: /Details/i })).toBeInTheDocument();
    expect(screen.getByText(/Sarah Johnson/i)).toBeInTheDocument();
    expect(screen.getByText(/28/i)).toBeInTheDocument(); // Age
    expect(screen.getByText(/Gluten-Free/i)).toBeInTheDocument(); // Dietary restriction
    expect(screen.getByText(/Post-workout recovery/i)).toBeInTheDocument(); // Motivation
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Close/i }));
    expect(screen.queryByRole('heading', { name: /Details/i })).not.toBeInTheDocument();
  });

  test('opens and displays details in view-details modal for a competitor', async () => {
    render(React.createElement(App, null));
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Competitors/i }));

    // Click 'View' button for Quest Nutrition
    // Since there are multiple 'View' buttons (one for each competitor), we find the specific button via its parent row.
    const questRow = screen.getByText('Quest Nutrition').closest('tr');
    expect(questRow).toBeInTheDocument();
    const viewButton = questRow?.querySelector('button.bg-blue-100'); // Targeting the specific 'View' button class
    if (viewButton) {
      await user.click(viewButton);
    } else {
        throw new Error("View button not found for Quest Nutrition");
    }

    // Modal should be open with Quest Nutrition's details
    expect(screen.getByRole('heading', { name: /Details/i })).toBeInTheDocument();
    expect(screen.getByText(/Quest Nutrition/i)).toBeInTheDocument();
    expect(screen.getByText(/Quest Bar/i)).toBeInTheDocument();
    expect(screen.getByText(/\$2.99/i)).toBeInTheDocument(); // Price
    expect(screen.getByText(/21g/i)).toBeInTheDocument(); // Protein
    expect(screen.getByText(/Fitness Enthusiasts/i)).toBeInTheDocument(); // Target Audience
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Close/i }));
    expect(screen.queryByRole('heading', { name: /Details/i })).not.toBeInTheDocument();
  });

  // Test 9: AI Insights - Prompt only
  test('sends prompt to AI Layer and displays result', async () => {
    render(React.createElement(App, null));
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /AI Insights/i }));

    const promptInput = screen.getByPlaceholderText(/Ask AI to analyze market trends, consumer behavior, or upload documents\/images for insights\.\.\./i); // Adjusted to exact placeholder text
    const generateButton = screen.getByRole('button', { name: /Generate AI Insights/i });

    await user.type(promptInput, 'Analyze protein bar market trends');
    await user.click(generateButton);

    // Check for loading state
    expect(screen.getByText(/Analyzing\.\.\./i)).toBeInTheDocument();

    // Wait for result
    await waitFor(() => {
      expect(screen.getByText(/AI Analysis Complete/i)).toBeInTheDocument();
      expect(screen.getByText(/AI result for: "Analyze protein bar market trends" with file: none/i)).toBeInTheDocument();
    });

    // Test clear button
    await user.click(screen.getByRole('button', { name: /Clear/i }));
    expect(screen.queryByText(/AI Analysis Complete/i)).not.toBeInTheDocument();
    expect(screen.getByText(/AI analysis results will appear here/i)).toBeInTheDocument();
  });

  // Test 10: AI Insights - Error state
  test('displays generic error message for AI analysis failure', async () => {
    render(React.createElement(App, null));
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /AI Insights/i }));

    const promptInput = screen.getByPlaceholderText(/Ask AI to analyze market trends, consumer behavior, or upload documents\/images for insights\.\.\./i);
    const generateButton = screen.getByRole('button', { name: /Generate AI Insights/i });

    await user.type(promptInput, 'Simulate error'); // Prompt to trigger error in mock AILayer
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('An error occurred during AI analysis')).toBeInTheDocument();
    });
  });

  // Test 11: AI Insights - File upload
  test('sends prompt with file to AI Layer', async () => {
    render(React.createElement(App, null));
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /AI Insights/i }));

    const fileInput = screen.getByLabelText(/Upload Document\/Image \(Optional\)/i);
    const promptInput = screen.getByPlaceholderText(/Ask AI to analyze market trends, consumer behavior, or upload documents\/images for insights\.\.\./i);
    const generateButton = screen.getByRole('button', { name: /Generate AI Insights/i });

    const testFile = new File(['hello'], 'test.pdf', { type: 'application/pdf' });
    await user.upload(fileInput, testFile);

    expect(screen.getByText('Selected: test.pdf')).toBeInTheDocument();

    await user.type(promptInput, 'Analyze this document');
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/AI Analysis Complete/i)).toBeInTheDocument();
      expect(screen.getByText(/AI result for: "Analyze this document" with file: test.pdf/i)).toBeInTheDocument();
    });
  });

  // Test 12: Export Data
  test('exports data correctly', async () => {
    render(React.createElement(App, null));
    const user = userEvent.setup();

    // Navigate to dashboard first to find the export button easily or directly click if it's always visible
    // The button is on the dashboard
    await user.click(screen.getByRole('button', { name: /Export Data/i }));

    // Expect createObjectURL to be called with a blob containing data
    expect(mockUrlCreateObjectURL).toHaveBeenCalledTimes(1);
    const blob = mockUrlCreateObjectURL.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/json');

    // Read the blob content to verify
    const reader = new FileReader();
    const readPromise = new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
    });
    reader.readAsText(blob);
    const exportedData = JSON.parse(await readPromise);

    // Check some exported data points (based on initial data loaded by the app)
    expect(exportedData.consumers).toHaveLength(3); 
    expect(exportedData.consumers[0].name).toBe('Sarah Johnson');
    expect(exportedData.marketData).toHaveLength(8);
    expect(exportedData.competitors).toHaveLength(3);
    expect(exportedData.surveys).toHaveLength(3);

    // Expect revokeObjectURL to be called
    expect(mockUrlRevokeObjectURL).toHaveBeenCalledTimes(1);
  });

  // Test 13: Import Data
  test('imports data correctly from a JSON file', async () => {
    render(React.createElement(App, null));
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Settings/i }));

    const importInput = screen.getByLabelText(/Import Data/i);
    // Create a mock file. The FileReader mock controls its content.
    const testFile = new File(['{}'], 'import.json', { type: 'application/json' });

    await user.upload(importInput, testFile);

    // Wait for alert to appear indicating success
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Data imported successfully!');
    });

    // Check if imported consumer is now visible (navigate to consumers view to verify)
    await user.click(screen.getByRole('button', { name: /Consumers/i }));
    expect(screen.getByText('Imported Consumer')).toBeInTheDocument();
    expect(screen.getByText(/30 years/i)).toBeInTheDocument(); // Age from mock imported data
  });

  // Test 14: Delete All Data
  test('deletes all data after confirmation', async () => {
    // Populate some data in localStorage first to ensure it's cleared
    localStorage.setItem('proteinBarConsumers', JSON.stringify([{ "id": "test-del", "name": "To Be Deleted", "age": 10, "gender": "Male" }]));
    localStorage.setItem('proteinBarMarketData', JSON.stringify([{ "id": "test-del-md", "category": "Test", "value": 1 }]));

    jest.spyOn(window, 'confirm').mockReturnValue(true); // Confirm deletion

    render(React.createElement(App, null));
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Settings/i }));

    await user.click(screen.getByRole('button', { name: /Delete All Data/i }));

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete all data? This action cannot be undone.');
    expect(window.alert).toHaveBeenCalledWith('All data has been deleted.');

    // Verify localStorage is cleared
    expect(localStorage.getItem('proteinBarConsumers')).toBe('[]');
    expect(localStorage.getItem('proteinBarMarketData')).toBe('[]');

    // Verify UI reflects data cleared (e.g., consumers view)
    await user.click(screen.getByRole('button', { name: /Consumers/i }));
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument(); // Initial data gone
    expect(screen.queryByText('To Be Deleted')).not.toBeInTheDocument(); // Previously saved data gone
  });

  test('does not delete all data if confirmation is denied', async () => {
    // Populate some data in localStorage first
    localStorage.setItem('proteinBarConsumers', JSON.stringify([{ "id": "test-keep", "name": "To Be Kept", "age": 10, "gender": "Male" }]));

    jest.spyOn(window, 'confirm').mockReturnValue(false); // Deny deletion

    render(React.createElement(App, null));
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Settings/i }));

    await user.click(screen.getByRole('button', { name: /Delete All Data/i }));

    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(window.alert).not.toHaveBeenCalled(); // No alert about deletion

    // Verify localStorage is NOT cleared
    expect(localStorage.getItem('proteinBarConsumers')).not.toBe('[]'); // Should still contain data
    expect(localStorage.getItem('proteinBarConsumers')).toBe('[{"id":"test-keep","name":"To Be Kept","age":10,"gender":"Male"}]');

    // Verify UI still shows initial data
    await user.click(screen.getByRole('button', { name: /Consumers/i }));
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument(); // Initial data still there
    expect(screen.getByText('To Be Kept')).toBeInTheDocument(); // Previously saved data still there
  });
});

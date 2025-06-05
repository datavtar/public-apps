// Test file content for tests/App.test.tsx goes here
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import App from '../src/App';
import { useAuth } from '../src/contexts/authContext';

// Mock `useAuth` context
const mockUseAuth = useAuth as jest.Mock;

// Define a type for the mock AILayerHandle to ensure type safety
interface MockAILayerHandle {
  sendToAI: jest.Mock;
  onResult?: (result: string) => void;
  onError?: (error: any) => void;
  onLoading?: (loading: boolean) => void;
}

// Mock `AILayer` component
const mockAILayerHandle: MockAILayerHandle = {
  sendToAI: jest.fn(),
};

jest.mock('../src/components/AILayer', () => {
  // eslint-disable-next-line react/display-name
  return React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => mockAILayerHandle);
    // Store the callbacks from props so tests can trigger them
    mockAILayerHandle.onResult = props.onResult;
    mockAILayerHandle.onError = props.onError;
    mockAILayerHandle.onLoading = props.onLoading;
    return <div data-testid="mock-ai-layer" />; // Render a simple div for the mock
  });
});

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value.toString(); }),
    clear: jest.fn(() => { store = {}; }),
    removeItem: jest.fn((key: string) => { delete store[key]; })
  };
})();

// Mock FileReader for import functionality
class MockFileReader {
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  result: string | ArrayBuffer | null = null;

  readAsText(blob: Blob) {
    // Simulate reading a JSON file with some default data
    const defaultData = {
      tutorials: [
        {
          id: 'mock-tutorial',
          title: 'Mock Tutorial',
          description: 'Mock Description',
          difficulty: 'beginner',
          estimatedTime: '10 min',
          completed: false,
          lessons: [{ id: 'mock-lesson', title: 'Mock Lesson', content: 'Mock Content', code: 'print("mock")', expectedOutput: 'mock', hints: [], completed: false }]
        }
      ],
      userProgress: { completedTutorials: [], completedLessons: [], totalScore: 100, streak: 5, lastActiveDate: '2023-01-01' },
      settings: { theme: 'dark', fontSize: 'large', autoSave: false, showHints: false }
    };
    // Simulate async read operation
    setTimeout(() => {
      this.result = JSON.stringify(defaultData);
      if (this.onload) {
        this.onload(new ProgressEvent('load'));
      }
    }, 0);
  }
}

describe('App Component', () => {
  const originalReload = window.location.reload;

  beforeAll(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, reload: jest.fn() },
    });
    // Mock URL.createObjectURL and revokeObjectURL for export
    global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
    global.URL.revokeObjectURL = jest.fn();
    // Mock FileReader for import
    Object.defineProperty(window, 'FileReader', { writable: true, value: MockFileReader });
  });

  beforeEach(() => {
    localStorageMock.clear(); // Clear localStorage before each test
    jest.clearAllMocks(); // Clear all jest mocks for clean state

    // Default mock auth state for authenticated user for most tests
    mockUseAuth.mockReturnValue({
      currentUser: { first_name: 'TestUser' },
      logout: jest.fn(),
    });
  });

  afterAll(() => {
    // Restore original functions after all tests
    window.location.reload = originalReload;
    jest.restoreAllMocks();
  });

  // Test 1: Shows loading state when currentUser is null
  test('shows loading state when user is not authenticated', () => {
    // Arrange
    mockUseAuth.mockReturnValueOnce({ currentUser: null, logout: jest.fn() });
    // Act
    render(<App />);
    // Assert
    expect(screen.getByText('Loading your Python learning journey...')).toBeInTheDocument();
  });

  // Test 2: Renders dashboard correctly for an authenticated user
  test('renders dashboard and welcome message for authenticated user', () => {
    // Arrange
    render(<App />);
    // Assert
    expect(screen.getByRole('heading', { name: /Python Learning Hub/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Welcome back, TestUser!/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Progress/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AI Helper/i })).toBeInTheDocument();
    expect(screen.getByText('TestUser')).toBeInTheDocument(); // Displays username
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });

  // Test 3: Toggles mobile menu
  test('toggles mobile menu on click', () => {
    // Arrange
    render(<App />);
    const mobileMenuButton = screen.getByRole('button', { name: 'Menu' });

    // Assert: Menu is initially hidden on larger screens, but for small screens (mocked by not being MD), it's initially closed.
    // We check for elements that would only appear when the menu is open.
    expect(screen.queryByRole('button', { name: 'Dashboard', hidden: true })).not.toBeVisible();

    // Act: Open menu
    fireEvent.click(mobileMenuButton);
    // Assert: Menu items are visible
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeVisible(); // Logout button within mobile menu

    // Act: Close menu
    fireEvent.click(mobileMenuButton);
    // Assert: Menu items are hidden again
    expect(screen.queryByRole('button', { name: 'Dashboard', hidden: true })).not.toBeVisible();
  });

  // Test 4: Navigates to Progress view
  test('navigates to Progress view from dashboard', async () => {
    // Arrange
    render(<App />);
    const progressButton = screen.getByRole('button', { name: /Progress/i });
    // Act
    fireEvent.click(progressButton);
    // Assert
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Learning Progress' })).toBeInTheDocument();
    });
  });

  // Test 5: Navigates to Settings view
  test('navigates to Settings view from dashboard', async () => {
    // Arrange
    render(<App />);
    const settingsButton = screen.getByRole('button', { name: /Settings/i });
    // Act
    fireEvent.click(settingsButton);
    // Assert
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    });
  });

  // Test 6: Starts a tutorial and displays lesson view
  test('starts a tutorial from the dashboard and shows the first lesson', async () => {
    // Arrange
    render(<App />);
    // Find the "Python Basics" tutorial using its test ID and then the button within it
    const pythonBasicsTutorialCard = screen.getByTestId('tutorial-python-basics');
    const startLearningButton = within(pythonBasicsTutorialCard).getByRole('button', { name: /Start Learning/i });
    // Act
    fireEvent.click(startLearningButton);
    // Assert
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hello World' })).toBeInTheDocument();
      expect(screen.getByText(/Lesson 1 of 3 • Python Basics/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('print("Hello, World!")')).toBeInTheDocument(); // Code editor shows initial code
    });
  });

  // Test 7: Hints toggle in Lesson view
  test('toggles hints visibility in lesson view', async () => {
    // Arrange
    render(<App />);
    fireEvent.click(within(screen.getByTestId('tutorial-python-basics')).getByRole('button', { name: /Start Learning/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hello World' })).toBeInTheDocument();
    });

    const showHintsButton = screen.getByRole('button', { name: /Show Hints/i });
    // Act & Assert: Show hints
    fireEvent.click(showHintsButton);
    expect(screen.getByText('Use the print() function')).toBeInTheDocument();
    expect(showHintsButton).toHaveTextContent('Hide Hints');

    // Act & Assert: Hide hints
    fireEvent.click(showHintsButton);
    expect(screen.queryByText('Use the print() function')).not.toBeInTheDocument();
    expect(showHintsButton).toHaveTextContent('Show Hints');
  });

  // Test 8: Run code and mark lesson complete on correct output
  test('runs code, displays correct output, and marks lesson complete', async () => {
    // Arrange
    render(<App />);
    fireEvent.click(within(screen.getByTestId('tutorial-python-basics')).getByRole('button', { name: /Start Learning/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hello World' })).toBeInTheDocument();
    });

    const codeEditor = screen.getByDisplayValue('print("Hello, World!")') as HTMLTextAreaElement;
    const runCodeButton = screen.getByRole('button', { name: /Run Code/i });

    // Act: Input correct code and run
    fireEvent.change(codeEditor, { target: { value: 'print("Hello, World!")' } });
    fireEvent.click(runCodeButton);

    // Assert: Output is correct and lesson is marked complete
    await waitFor(() => {
      expect(screen.getByText('Hello, World!')).toBeInTheDocument(); // Output display
      expect(screen.getByText(/Great job! You've completed this lesson./i)).toBeInTheDocument(); // Completion message
    });
  });

  // Test 9: Run code with incorrect output
  test('runs code, displays incorrect output, and does NOT mark lesson complete', async () => {
    // Arrange
    render(<App />);
    fireEvent.click(within(screen.getByTestId('tutorial-python-basics')).getByRole('button', { name: /Start Learning/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hello World' })).toBeInTheDocument();
    });

    const codeEditor = screen.getByDisplayValue('print("Hello, World!")') as HTMLTextAreaElement;
    const runCodeButton = screen.getByRole('button', { name: /Run Code/i });

    // Act: Input incorrect code and run
    fireEvent.change(codeEditor, { target: { value: 'print("Wrong Output")' } });
    fireEvent.click(runCodeButton);

    // Assert: Output is incorrect and no completion message
    await waitFor(() => {
      expect(screen.getByText('Wrong Output')).toBeInTheDocument();
      expect(screen.queryByText(/Great job! You've completed this lesson./i)).not.toBeInTheDocument();
    });
  });

  // Test 10: Navigates to the next lesson
  test('navigates to the next lesson when "Next" is clicked', async () => {
    // Arrange
    render(<App />);
    fireEvent.click(within(screen.getByTestId('tutorial-python-basics')).getByRole('button', { name: /Start Learning/i })); // Start 'Hello World'
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hello World' })).toBeInTheDocument();
    });

    // Act: Click next lesson button
    const nextLessonButton = screen.getByRole('button', { name: /^Next$/i }); // Accessible name for ChevronRight
    fireEvent.click(nextLessonButton);

    // Assert: New lesson details are displayed
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Variables' })).toBeInTheDocument();
      expect(screen.getByText(/Lesson 2 of 3 • Python Basics/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/name = "Alice"/i)).toBeInTheDocument(); // Code for 'Variables' lesson
    });
  });

  // Test 11: Navigates to the previous lesson
  test('navigates to the previous lesson when "Back" is clicked', async () => {
    // Arrange
    render(<App />);
    fireEvent.click(within(screen.getByTestId('tutorial-python-basics')).getByRole('button', { name: /Start Learning/i })); // Start 'Hello World'
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hello World' })).toBeInTheDocument();
    });

    // First, go to the next lesson to enable 'Previous'
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Variables' })).toBeInTheDocument();
    });

    // Act: Click previous lesson button
    const previousLessonButton = screen.getByRole('button', { name: /^Back$/i }); // Accessible name for ChevronLeft
    fireEvent.click(previousLessonButton);

    // Assert: Returns to the previous lesson
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hello World' })).toBeInTheDocument();
      expect(screen.getByText(/Lesson 1 of 3 • Python Basics/i)).toBeInTheDocument();
    });
  });

  // Test 12: Exports progress data
  test('exports user progress data', async () => {
    // Arrange
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i })); // Navigate to settings
    const exportButton = screen.getByRole('button', { name: /Export All Data/i });

    // Act
    fireEvent.click(exportButton);

    // Assert
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
  });

  // Test 13: Imports progress data
  test('imports user progress data from a file', async () => {
    // Arrange
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i })); // Navigate to settings

    const importInput = screen.getByLabelText(/Import Data/i);

    // Act: Simulate file selection and change event
    const mockFile = new File(['{"tutorials": [], "userProgress": {}, "settings": {}}'], 'progress.json', { type: 'application/json' });
    await act(async () => {
      fireEvent.change(importInput, { target: { files: [mockFile] } });
    });

    // Assert: Verify localStorage was updated based on the mock FileReader
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('pythonTutorials', expect.any(String));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userProgress', expect.any(String));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('appSettings', expect.any(String));
    });
  });

  // Test 14: Clears all data
  test('clears all application data and reloads the page', async () => {
    // Arrange: Populate localStorage to simulate existing data
    localStorageMock.setItem('pythonTutorials', '[]');
    localStorageMock.setItem('userProgress', '{}');
    localStorageMock.setItem('appSettings', '{}');

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i })); // Navigate to settings
    const clearDataButton = screen.getByRole('button', { name: /Clear All Data/i });

    // Act
    fireEvent.click(clearDataButton);

    // Assert: localStorage items are removed and page reloads
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('pythonTutorials');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('userProgress');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('appSettings');
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  // Test 15: AI Helper modal opens and closes
  test('AI Helper modal opens and closes correctly', async () => {
    // Arrange
    render(<App />);
    const aiHelperButton = screen.getByRole('button', { name: /AI Helper/i });
    // Act: Open modal
    fireEvent.click(aiHelperButton);
    // Assert: Modal content is visible
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'AI Python Helper' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /Ask me anything about Python:/i })).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /Close/i });
    // Act: Close modal
    fireEvent.click(closeButton);
    // Assert: Modal content is no longer visible
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'AI Python Helper' })).not.toBeInTheDocument();
    });
  });

  // Test 16: Ask AI functionality with successful response
  test('AI Helper responds successfully with a result', async () => {
    // Arrange
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /AI Helper/i }));
    const aiInput = screen.getByRole('textbox', { name: /Ask me anything about Python:/i });
    const askAIButton = screen.getByRole('button', { name: /Ask AI/i });
    
    fireEvent.change(aiInput, { target: { value: 'What is a list?' } });
    
    // Act
    fireEvent.click(askAIButton);

    // Assert: sendToAI is called with context prompt
    expect(mockAILayerHandle.sendToAI).toHaveBeenCalledWith(expect.stringContaining('What is a list?'));

    // Simulate loading state
    act(() => {
        if (mockAILayerHandle.onLoading) mockAILayerHandle.onLoading(true);
    });
    expect(askAIButton).toBeDisabled();
    expect(screen.getByText('Thinking...')).toBeInTheDocument();

    // Simulate successful AI response
    act(() => {
        if (mockAILayerHandle.onLoading) mockAILayerHandle.onLoading(false);
        if (mockAILayerHandle.onResult) mockAILayerHandle.onResult('A list is an ordered collection of items.');
    });

    // Assert: AI result is displayed and button is re-enabled
    await waitFor(() => {
      expect(screen.getByText('A list is an ordered collection of items.')).toBeInTheDocument();
      expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
      expect(askAIButton).not.toBeDisabled();
    });
  });

  // Test 17: Ask AI functionality with error response
  test('AI Helper displays error message on AI processing error', async () => {
    // Arrange
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /AI Helper/i }));
    const aiInput = screen.getByRole('textbox', { name: /Ask me anything about Python:/i });
    const askAIButton = screen.getByRole('button', { name: /Ask AI/i });
    
    fireEvent.change(aiInput, { target: { value: 'Generate code' } });
    
    // Act
    fireEvent.click(askAIButton);

    // Simulate loading state
    act(() => {
        if (mockAILayerHandle.onLoading) mockAILayerHandle.onLoading(true);
    });
    
    // Simulate AI error response
    act(() => {
        if (mockAILayerHandle.onLoading) mockAILayerHandle.onLoading(false);
        if (mockAILayerHandle.onError) mockAILayerHandle.onError('API rate limit exceeded.');
    });

    // Assert: Error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Error: API rate limit exceeded.')).toBeInTheDocument();
      expect(askAIButton).not.toBeDisabled();
    });
  });

  // Test 18: AI Helper prompt validation (prevents empty prompt)
  test('AI Helper shows error when prompt is empty or just spaces', async () => {
    // Arrange
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /AI Helper/i }));
    const aiInput = screen.getByRole('textbox', { name: /Ask me anything about Python:/i });
    const askAIButton = screen.getByRole('button', { name: /Ask AI/i });

    // Act: Enter only spaces and try to ask
    fireEvent.change(aiInput, { target: { value: '   ' } });
    fireEvent.click(askAIButton);

    // Assert: sendToAI is NOT called and error message is shown
    expect(mockAILayerHandle.sendToAI).not.toHaveBeenCalled();
    await waitFor(() => {
        expect(screen.getByText('Please enter a question about Python')).toBeInTheDocument();
    });
  });

  // Test 19: Changes theme and font size settings
  test('allows changing theme and font size in settings', async () => {
    // Arrange
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));
    const themeSelect = screen.getByRole('combobox', { name: /Theme/i });
    const fontSizeSelect = screen.getByRole('combobox', { name: /Font Size/i });

    // Act & Assert: Change theme to dark
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('appSettings', expect.stringContaining('"theme":"dark"'));

    // Act & Assert: Change font size to large
    fireEvent.change(fontSizeSelect, { target: { value: 'large' } });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('appSettings', expect.stringContaining('"fontSize":"large"'));
  });

  // Test 20: Changes learning preferences settings (auto-save and show hints)
  test('allows changing auto-save and show hints preferences', async () => {
    // Arrange
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));
    const autoSaveCheckbox = screen.getByRole('checkbox', { name: /Auto-save progress/i });
    const showHintsCheckbox = screen.getByRole('checkbox', { name: /Show hints by default/i });

    // Act & Assert: Toggle auto-save (initial state is true, so clicking makes it false)
    fireEvent.click(autoSaveCheckbox);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('appSettings', expect.stringContaining('"autoSave":false'));

    // Act & Assert: Toggle show hints (initial state is true, so clicking makes it false)
    fireEvent.click(showHintsCheckbox);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('appSettings', expect.stringContaining('"showHints":false'));
  });
});
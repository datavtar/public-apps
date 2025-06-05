import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock the auth context
jest.mock('../src/contexts/authContext', () => ({
  useAuth: jest.fn(() => ({
    currentUser: { first_name: 'TestUser' },
    logout: jest.fn(),
  })),
}));

// Mock the AILayer component
jest.mock('../src/components/AILayer', () => {
  const { forwardRef, useImperativeHandle } = jest.requireActual('react');
  const actualAILayerTypes = jest.requireActual('../src/components/AILayer.types');

  const MockAILayer = forwardRef<actualAILayerTypes.AILayerHandle, any>(({ onResult, onError, onLoading }, ref) => {
    useImperativeHandle(ref, () => ({
      sendToAI: jest.fn((prompt: string, attachment?: File) => {
        onLoading(true);
        if (prompt.includes('error')) {
          // Simulate an error response
          setTimeout(() => {
            onError('Simulated AI Error for: ' + prompt);
            onLoading(false);
          }, 10);
          return;
        }
        // Simulate a successful response
        setTimeout(() => {
          onResult(`AI response for: ${prompt} ${attachment ? `with file ${attachment.name}` : ''}`);
          onLoading(false);
        }, 10);
      }),
    }));
    return null; // AILayer is not rendered visually, only provides an imperative handle
  });
  return {
    __esModule: true,
    default: MockAILayer,
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location.reload
const originalReload = window.location.reload;
window.location.reload = jest.fn();

// Mock URL.createObjectURL and URL.revokeObjectURL for data export
const mockURL = 'blob:mockurl/1234';
const createObjectURLMock = jest.fn(() => mockURL);
const revokeObjectURLMock = jest.fn();
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: createObjectURLMock,
    revokeObjectURL: revokeObjectURLMock,
  },
  writable: true,
});

// Mock FileReader
class MockFileReader {
  onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((e: ProgressEvent<FileReader>) => void) | null = null;
  result: string | ArrayBuffer | null = null;

  readAsText(file: Blob) {
    if (file.type === 'error/simulate') {
      if (this.onerror) {
        this.onerror(new ProgressEvent('error'));
      }
    } else {
      this.result = 'mock,csv,content\n1,2,3';
      if (this.onload) {
        this.onload(new ProgressEvent('load'));
      }
    }
  }
}
Object.defineProperty(window, 'FileReader', {
  value: MockFileReader,
  writable: true,
});

// Mock global alert
const mockAlert = jest.fn();
Object.defineProperty(window, 'alert', {
  value: mockAlert,
});

// Mock global confirm
const mockConfirm = jest.fn(() => true); // Default to true for easy clears
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
});

describe('App', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.setItem('darkMode', 'false'); // Set initial dark mode state to false for consistency
    document.documentElement.classList.remove('dark'); // Ensure no dark class for consistent tests
    window.location.reload = jest.fn(); // Reset mock reload for each test
    mockConfirm.mockReturnValue(true); // Reset confirm to true
  });

  // Test 1: Basic rendering - Not logged in
  test('renders login message when currentUser is null', () => {
    const { useAuth } = require('../src/contexts/authContext');
    useAuth.mockReturnValue({ currentUser: null, logout: jest.fn() });

    render(<App />);
    expect(screen.getByText(/Please log in to access your jewelry business insights./i)).toBeInTheDocument();
    expect(screen.queryByText(/Welcome, TestUser/i)).not.toBeInTheDocument();
  });

  // Test 2: Basic rendering - Logged in (Dashboard view)
  test('renders dashboard and welcome message when currentUser is present', () => {
    render(<App />);
    expect(screen.getByText(/Welcome, TestUser/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /14K Gold Jewelry Insights/i })).toBeInTheDocument(); // Dashboard title
    expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument(); // Dashboard metric
  });

  // Test 3: Navigation - Sidebar (Desktop)
  test('navigates to different views via sidebar buttons (desktop)', async () => {
    render(<App />);

    // Click Demographics
    fireEvent.click(screen.getByRole('button', { name: /Demographics/i }));
    expect(screen.getByRole('heading', { name: /Customer Demographics/i })).toBeInTheDocument();
    expect(screen.queryByText(/Total Revenue/i)).not.toBeInTheDocument(); // Dashboard content should be gone

    // Click Products
    fireEvent.click(screen.getByRole('button', { name: /Products/i }));
    expect(screen.getByRole('heading', { name: /Product Performance/i })).toBeInTheDocument();

    // Click Trends
    fireEvent.click(screen.getByRole('button', { name: /Trends/i }));
    expect(screen.getByRole('heading', { name: /Market Trends/i })).toBeInTheDocument();

    // Click Feedback
    fireEvent.click(screen.getByRole('button', { name: /Feedback/i }));
    expect(screen.getByRole('heading', { name: /Customer Feedback/i })).toBeInTheDocument();

    // Click Settings
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));
    expect(screen.getByRole('heading', { name: /Settings/i })).toBeInTheDocument();

    // Click Dashboard back
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByRole('heading', { name: /14K Gold Jewelry Insights/i })).toBeInTheDocument();
  });

  // Test 4: Navigation - Mobile menu (by icon names)
  test('navigates to different views via mobile menu buttons', async () => {
    render(<App />);

    // Click mobile Demographics button (using the name from the Lucide icon Users)
    fireEvent.click(screen.getByRole('button', { name: /users/i })); 
    expect(screen.getByRole('heading', { name: /Customer Demographics/i })).toBeInTheDocument();

    // Click mobile Products button (using the name from the Lucide icon Package)
    fireEvent.click(screen.getByRole('button', { name: /package/i }));
    expect(screen.getByRole('heading', { name: /Product Performance/i })).toBeInTheDocument();

    // Click mobile Trends button (using the name from the Lucide icon TrendingUp)
    fireEvent.click(screen.getByRole('button', { name: /trending up/i }));
    expect(screen.getByRole('heading', { name: /Market Trends/i })).toBeInTheDocument();

    // Click mobile Settings button (using the name from the Lucide icon Settings)
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByRole('heading', { name: /Settings/i })).toBeInTheDocument();

    // Click mobile Dashboard button (using the name from the Lucide icon BarChart3)
    fireEvent.click(screen.getByRole('button', { name: /bar chart 3/i }));
    expect(screen.getByRole('heading', { name: /14K Gold Jewelry Insights/i })).toBeInTheDocument();
  });

  // Test 5: Dark Mode toggle
  test('toggles dark mode correctly', () => {
    render(<App />);

    const htmlElement = document.documentElement;
    
    // Initial state check based on localStorageMock.setItem('darkMode', 'false') in beforeEach
    expect(localStorageMock.getItem('darkMode')).toBe('false');
    expect(htmlElement).not.toHaveClass('dark');

    // Click to enable dark mode. Button initially says 'Switch to dark mode'
    fireEvent.click(screen.getByRole('button', { name: /Switch to dark mode/i })); 
    expect(htmlElement).toHaveClass('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'true');
    expect(screen.getByRole('button', { name: /Switch to light mode/i })).toBeInTheDocument(); // Button text changes

    // Click to disable dark mode
    fireEvent.click(screen.getByRole('button', { name: /Switch to light mode/i }));
    expect(htmlElement).not.toHaveClass('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'false');
  });

  // Test 6: AI Analysis - Dashboard (Trends)
  test('triggers AI analysis for trends from dashboard and displays result', async () => {
    const { default: MockAILayer } = require('../src/components/AILayer');
    render(<App />);

    // Ensure AI result section is not visible initially
    expect(screen.queryByText(/AI Insights/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /AI Analysis/i })); // Button for dashboard AI analysis

    // Check loading state
    expect(screen.getByText(/Analyzing data.../i)).toBeInTheDocument();

    // Wait for AI result
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /AI Insights/i })).toBeInTheDocument();
      expect(screen.getByText(/AI response for: Analyze market trends for 14k gold jewelry and provide strategic recommendations/i)).toBeInTheDocument();
    });

    // Check that sendToAI was called
    // The mock returns an object with sendToAI, so we access it from the first call's value
    expect(MockAILayer.default.mock.results[0].value.sendToAI).toHaveBeenCalled(); 
  });

  // Test 7: AI Analysis - Demographics
  test('triggers AI analysis for demographics and displays result', async () => {
    const { default: MockAILayer } = require('../src/components/AILayer');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Demographics/i })); // Navigate to Demographics
    fireEvent.click(screen.getByRole('button', { name: /Analyze Demographics/i }));

    expect(screen.getByText(/Analyzing data.../i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /AI Demographics Analysis/i })).toBeInTheDocument();
      expect(screen.getByText(/AI response for: Analyze customer demographics for 14k gold jewelry business/i)).toBeInTheDocument();
    });
    expect(MockAILayer.default.mock.results[0].value.sendToAI).toHaveBeenCalled();
  });

  // Test 8: AI Analysis - Feedback
  test('triggers AI analysis for feedback and displays result', async () => {
    const { default: MockAILayer } = require('../src/components/AILayer');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Feedback/i })); // Navigate to Feedback
    fireEvent.click(screen.getByRole('button', { name: /Analyze Feedback/i }));

    expect(screen.getByText(/Analyzing data.../i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /AI Feedback Analysis/i })).toBeInTheDocument();
      expect(screen.getByText(/AI response for: Analyze the following customer feedback for 14k gold jewelry/i)).toBeInTheDocument();
    });
    expect(MockAILayer.default.mock.results[0].value.sendToAI).toHaveBeenCalled();
  });

  // Test 9: AI Analysis - Custom Prompt and File (Settings)
  test('triggers custom AI analysis with prompt and file from settings', async () => {
    const { default: MockAILayer } = require('../src/components/AILayer');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i })); // Navigate to Settings

    const promptInput = screen.getByPlaceholderText(/Enter your custom analysis prompt.../i);
    fireEvent.change(promptInput, { target: { value: 'Analyze this custom text' } });

    // Using label text to find the file input
    const fileInput = screen.getByLabelText(/Upload Document for Analysis/i);
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText(/Selected: test.txt/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Run AI Analysis/i }));

    expect(screen.getByText(/Analyzing data.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /AI Insights/i })).toBeInTheDocument();
      expect(screen.getByText(/AI response for: Analyze this custom text with file test.txt/i)).toBeInTheDocument();
    });
    expect(MockAILayer.default.mock.results[0].value.sendToAI).toHaveBeenCalledWith('Analyze this custom text', file);
  });

  // Test 10: AI Analysis - Error State
  test('displays AI error message when analysis fails', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));

    const promptInput = screen.getByPlaceholderText(/Enter your custom analysis prompt.../i);
    fireEvent.change(promptInput, { target: { value: 'simulate error' } }); // This prompt will trigger the error mock

    fireEvent.click(screen.getByRole('button', { name: /Run AI Analysis/i }));

    expect(screen.getByText(/Analyzing data.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Error: Simulated AI Error for: simulate error/i)).toBeInTheDocument();
      expect(screen.queryByText(/Analyzing data.../i)).not.toBeInTheDocument();
    });
  });

  // Test 11: Data Export
  test('exports data successfully', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));

    fireEvent.click(screen.getByRole('button', { name: /Export Data/i }));

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith(mockURL);
  });

  // Test 12: Data Import - Success
  test('imports data successfully', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));

    const file = new File(['mock,csv,content'], 'import.csv', { type: 'text/csv' });
    // The input is hidden, the label is clickable. So find the input via its label.
    const importInput = screen.getByLabelText(/Import Data/i);
    
    fireEvent.change(importInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Data imported successfully!');
    });
  });

  // Test 13: Data Import - Failure
  test('displays error on failed data import', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));

    // Simulate an error file type or content
    const errorFile = new File(['bad content'], 'error.csv', { type: 'error/simulate' }); // Custom type for mock error
    const importInput = screen.getByLabelText(/Import Data/i);
    fireEvent.change(importInput, { target: { files: [errorFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Failed to import data. Please check file format./i)).toBeInTheDocument();
    });
  });

  // Test 14: Download Template
  test('downloads template successfully', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));

    fireEvent.click(screen.getByRole('button', { name: /Download Template/i }));

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith(mockURL);
  });

  // Test 15: Clear All Data
  test('clears all data and reloads application', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));

    fireEvent.click(screen.getByRole('button', { name: /Clear All Data/i }));

    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to clear all data? This action cannot be undone.');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('jewelryDemographics');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('jewelryProducts');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('jewelryTrends');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('jewelryFeedback');
    expect(window.location.reload).toHaveBeenCalled();
  });

  // Test 16: Reset Demo Data
  test('resets to demo data', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));

    // Before reset, let's simulate different data or cleared data in localStorage.
    localStorageMock.setItem('jewelryDemographics', '[]'); 
    localStorageMock.setItem('jewelryProducts', '[]');
    localStorageMock.setItem('jewelryTrends', '[]');
    localStorageMock.setItem('jewelryFeedback', '[]');

    fireEvent.click(screen.getByRole('button', { name: /Reset Demo Data/i }));

    // After click, the useEffect for saveData() will trigger, saving the new demo data.
    // We verify if localStorage was updated with non-empty demo data.
    expect(localStorageMock.setItem).toHaveBeenCalledWith('jewelryDemographics', expect.any(String));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('jewelryProducts', expect.any(String));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('jewelryTrends', expect.any(String));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('jewelryFeedback', expect.any(String));
    
    // Verify content is not '[]' for demo data (i.e., actually contains generated data)
    expect(JSON.parse(localStorageMock.getItem('jewelryDemographics') || '[]').length).toBeGreaterThan(0);
    expect(JSON.parse(localStorageMock.getItem('jewelryProducts') || '[]').length).toBeGreaterThan(0);
  });

  // Test 17: Search in Demographics
  test('filters demographics based on search term', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Demographics/i }));

    // Initial check: all demo data entries should be present
    expect(screen.getByText('25-35')).toBeInTheDocument();
    expect(screen.getByText('35-45')).toBeInTheDocument();
    expect(screen.getByText('45-55')).toBeInTheDocument();


    const searchInput = screen.getByPlaceholderText(/Search demographics.../i);
    fireEvent.change(searchInput, { target: { value: '25-35' } });

    // Only '25-35' should remain after filtering
    expect(screen.getByText('25-35')).toBeInTheDocument();
    expect(screen.queryByText('35-45')).not.toBeInTheDocument();
    expect(screen.queryByText('45-55')).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '' } }); // Clear search
    // All should be visible again
    expect(screen.getByText('25-35')).toBeInTheDocument();
    expect(screen.getByText('35-45')).toBeInTheDocument();
  });

  // Test 18: Filter in Products
  test('filters products based on category selection', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Products/i }));

    // Initial check: All categories should be visible
    expect(screen.getByText('14K Gold Solitaire Ring')).toBeInTheDocument(); // Rings
    expect(screen.getByText('14K Gold Chain Necklace')).toBeInTheDocument(); // Necklaces
    expect(screen.getByText('14K Gold Stud Earrings')).toBeInTheDocument(); // Earrings

    const categorySelect = screen.getByRole('combobox', { name: '' }); // Select element does not have a visible label, so it will be accessed by its role
    fireEvent.change(categorySelect, { target: { value: 'Rings' } });

    // Only 'Rings' category products should be visible
    expect(screen.getByText('14K Gold Solitaire Ring')).toBeInTheDocument();
    expect(screen.queryByText('14K Gold Chain Necklace')).not.toBeInTheDocument();
    expect(screen.queryByText('14K Gold Stud Earrings')).not.toBeInTheDocument();

    fireEvent.change(categorySelect, { target: { value: 'all' } }); // Reset filter
    expect(screen.getByText('14K Gold Solitaire Ring')).toBeInTheDocument();
    expect(screen.getByText('14K Gold Chain Necklace')).toBeInTheDocument();
    expect(screen.getByText('14K Gold Stud Earrings')).toBeInTheDocument();
  });

  // Test 19: Search and Filter combined in Products
  test('filters products based on search term and category selection', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Products/i }));

    const searchInput = screen.getByPlaceholderText(/Search products.../i);
    const categorySelect = screen.getByRole('combobox', { name: '' });

    // Apply category filter first
    fireEvent.change(categorySelect, { target: { value: 'Rings' } });
    expect(screen.getByText('14K Gold Solitaire Ring')).toBeInTheDocument();
    expect(screen.queryByText('14K Gold Chain Necklace')).not.toBeInTheDocument();

    // Now apply search term on top of filtered results
    fireEvent.change(searchInput, { target: { value: 'Solitaire' } });
    expect(screen.getByText('14K Gold Solitaire Ring')).toBeInTheDocument();
    expect(screen.queryByText('14K Gold Chain Necklace')).not.toBeInTheDocument(); 
    expect(screen.queryByText('14K Gold Stud Earrings')).not.toBeInTheDocument(); 

    // Change search term to something not matching current filter
    fireEvent.change(searchInput, { target: { value: 'Chain' } });
    expect(screen.queryByText('14K Gold Solitaire Ring')).not.toBeInTheDocument(); // Ring should be gone
    expect(screen.queryByText('14K Gold Chain Necklace')).not.toBeInTheDocument(); // Necklace won't appear because of category filter

    // Clear category filter, now necklace should appear (because search term 'Chain' is still active)
    fireEvent.change(categorySelect, { target: { value: 'all' } });
    expect(screen.getByText('14K Gold Chain Necklace')).toBeInTheDocument();
    expect(screen.queryByText('14K Gold Solitaire Ring')).not.toBeInTheDocument();
  });
});
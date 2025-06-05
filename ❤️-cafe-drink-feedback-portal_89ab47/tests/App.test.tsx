import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

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

// Mock useAuth context
jest.mock('./contexts/authContext', () => ({
  useAuth: () => ({
    currentUser: { first_name: 'Test' }, // Simulate a logged-in user
    logout: jest.fn(),
  }),
}));

// Mock AILayer component
// We need to capture the ref to call sendToAI
let mockSendToAI: jest.Mock;
jest.mock('./components/AILayer', () => {
  const React = require('react'); // eslint-disable-line @typescript-eslint/no-var-requires
  const AILayer = React.forwardRef(({ onResult, onError, onLoading }: any, ref: any) => {
    mockSendToAI = jest.fn((prompt) => {
      onLoading(true);
      // Simulate a positive sentiment result
      const mockResult = JSON.stringify({ sentiment: 'positive', insights: 'Great feedback!' });
      setTimeout(() => {
        onResult(mockResult);
        onLoading(false);
      }, 50); // Small delay to simulate async operation
    });

    React.useImperativeHandle(ref, () => ({
      sendToAI: mockSendToAI,
    }));
    return <div data-testid="ai-layer-mock">AI Layer Mock</div>;
  });
  return AILayer;
});

// Define sample data that matches the app's internal SAMPLE_DRINKS and SAMPLE_FEEDBACK
const SAMPLE_DRINKS_MOCK = [
  { id: '1', name: 'Espresso', category: 'Coffee', description: 'Rich and bold espresso shot', price: 2.50, isActive: true },
  { id: '2', name: 'Cappuccino', category: 'Coffee', description: 'Creamy espresso with steamed milk', price: 4.00, isActive: true },
  { id: '3', name: 'Green Tea Latte', category: 'Tea', description: 'Smooth green tea with milk', price: 3.50, isActive: true },
  { id: '4', name: 'Berry Smoothie', category: 'Smoothies', description: 'Fresh berries with yogurt', price: 5.50, isActive: true },
  { id: '5', name: 'Iced Coffee', category: 'Cold Drinks', description: 'Refreshing cold brew coffee', price: 3.00, isActive: true },
  { id: '6', name: 'Hot Chocolate Deluxe', category: 'Hot Chocolate', description: 'Rich chocolate with whipped cream', price: 4.50, isActive: true }
];

const SAMPLE_FEEDBACK_MOCK = [
  {
    id: '1',
    drinkId: '1',
    drinkName: 'Espresso',
    customerName: 'John Doe',
    email: 'john@example.com',
    rating: 5,
    comment: 'Perfect espresso! Rich flavor and great aroma.',
    category: 'Coffee',
    timestamp: '2025-06-04T10:30:00Z',
    sentiment: 'positive'
  },
  {
    id: '2',
    drinkId: '2',
    drinkName: 'Cappuccino',
    customerName: 'Jane Smith',
    email: 'jane@example.com',
    rating: 4,
    comment: 'Good cappuccino, could use a bit more foam.',
    category: 'Coffee',
    timestamp: '2025-06-04T11:15:00Z',
    sentiment: 'positive'
  },
  {
    id: '3',
    drinkId: '4',
    drinkName: 'Berry Smoothie',
    customerName: 'Mike Johnson',
    rating: 5,
    comment: 'Amazing smoothie! Fresh berries and perfect consistency.',
    category: 'Smoothies',
    timestamp: '2025-06-05T09:20:00Z',
    sentiment: 'positive'
  }
];

describe('App', () => {
  beforeEach(() => {
    // Clear mock localStorage before each test
    localStorageMock.clear();
    // Re-initialize localStorage with sample data for consistent tests
    localStorageMock.setItem('cafe-drinks', JSON.stringify(SAMPLE_DRINKS_MOCK));
    localStorageMock.setItem('cafe-feedback', JSON.stringify(SAMPLE_FEEDBACK_MOCK));
    // Reset mock AI function
    if (mockSendToAI) {
      mockSendToAI.mockClear();
    }
    // Mock window.URL.createObjectURL and revokeObjectURL for file download tests
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  // Test 1: Basic rendering for authenticated user
  test('renders the App for an authenticated user and shows dashboard by default', () => {
    render(<App />);

    // Assert header elements
    expect(screen.getByText('Cafe Feedback Hub')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Test!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();

    // Assert navigation items
    expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Feedback Form/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Manage Drinks/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analytics/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Settings/i })).toBeInTheDocument();

    // Assert dashboard content
    expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument(); // Using testId for complex element
    expect(screen.getByText('Total Feedback')).toBeInTheDocument();
    expect(screen.getByText('Average Rating')).toBeInTheDocument();
  });

  // Test 2: Navigation changes view
  test('navigation buttons change the current view', async () => {
    render(<App />);

    // Navigate to Feedback Form
    fireEvent.click(screen.getByRole('button', { name: /Feedback Form/i }));
    expect(screen.getByText('Share Your Experience')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-form-card')).toBeInTheDocument();

    // Navigate to Manage Drinks
    fireEvent.click(screen.getByRole('button', { name: /Manage Drinks/i }));
    expect(screen.getByText('Manage Drinks')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Drink/i })).toBeInTheDocument();

    // Navigate to Analytics
    fireEvent.click(screen.getByRole('button', { name: /Analytics/i }));
    expect(screen.getByText('Analytics & Insights')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-filters')).toBeInTheDocument(); // Using testId

    // Navigate to Settings
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByTestId('data-management')).toBeInTheDocument(); // Using testId

    // Navigate back to Dashboard
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument();
  });

  // Test 3: Submit feedback successfully
  test('submits feedback successfully and shows success notification', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Feedback Form/i }));

    // Fill customer info
    fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'Test Customer' } });
    fireEvent.change(screen.getByLabelText(/Email \(Optional\)/i), { target: { value: 'test@example.com' } });

    // Select category (Coffee)
    fireEvent.click(screen.getByRole('button', { name: /Coffee/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Espresso/i })).toBeInTheDocument();
    });

    // Select drink (Espresso)
    fireEvent.click(screen.getByRole('button', { name: /Espresso/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/Rating \*/i)).toBeInTheDocument();
    });

    // Set rating to 5 stars
    // Using `getAllByRole` and index because multiple star buttons exist for rating selection
    fireEvent.click(screen.getAllByRole('button', { hidden: true })[4]); // Clicks the 5th star button
    fireEvent.change(screen.getByLabelText(/Comments/i), { target: { value: 'This is a great comment for Espresso.' } });

    // Submit feedback
    fireEvent.click(screen.getByRole('button', { name: /Submit Feedback/i }));

    // Expect success notification
    await waitFor(() => {
      expect(screen.getByText('Thank you for your feedback!')).toBeInTheDocument();
    });

    // Expect AI Layer to have been called
    expect(mockSendToAI).toHaveBeenCalledTimes(1);
    expect(mockSendToAI).toHaveBeenCalledWith(expect.stringContaining('Analyze the sentiment of this customer feedback and provide insights: "This is a great comment for Espresso."'));

    // Check if feedback is updated (by navigating to analytics and checking count)
    fireEvent.click(screen.getByRole('button', { name: /Analytics/i }));
    await waitFor(() => {
      // The total count will be 3 initial + 1 new feedback = 4
      expect(screen.getByText('Feedback Details (4)')).toBeInTheDocument();
      expect(screen.getByText('Test Customer')).toBeInTheDocument();
      expect(screen.getByText('Great feedback!')).toBeInTheDocument(); // From AI mock
    });
  });

  // Test 4: Required fields validation for feedback form
  test('shows error notification if required feedback fields are not filled', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Feedback Form/i }));

    // Attempt to submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /Submit Feedback/i }));

    // Expect error notification
    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    });

    // Fill only name, still expect error because drink and rating are missing
    fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'Partial User' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit Feedback/i }));
    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    });
  });

  // Test 5: Add a new drink
  test('adds a new drink successfully', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Manage Drinks/i }));

    fireEvent.click(screen.getByRole('button', { name: /Add Drink/i }));

    // Fill form
    fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'New Test Coffee' } });
    fireEvent.change(screen.getByLabelText(/Category \*/i), { target: { value: 'Coffee' } });
    fireEvent.change(screen.getByLabelText(/Price \*/i), { target: { value: '6.50' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'A delicious new test coffee.' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Drink/i }));

    // Expect notification
    await waitFor(() => {
      expect(screen.getByText('Drink added successfully!')).toBeInTheDocument();
    });

    // Expect the new drink to be in the list
    expect(screen.getByText('New Test Coffee')).toBeInTheDocument();
    expect(screen.getByText('$6.50')).toBeInTheDocument();
    expect(screen.getByText('A delicious new test coffee.')).toBeInTheDocument();
  });

  // Test 6: Edit an existing drink
  test('edits an existing drink successfully', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Manage Drinks/i }));

    // Find the "Edit" button for Espresso (first drink in SAMPLE_DRINKS_MOCK)
    const espressoCard = screen.getByText('Espresso').closest('.card') as HTMLElement;
    fireEvent.click(screen.getByRole('button', { name: /Edit drink/i, container: espressoCard }));

    // Form should be pre-filled, change name and price
    expect(screen.getByLabelText(/Name \*/i)).toHaveValue('Espresso');
    fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'Espresso (Updated)' } });
    fireEvent.change(screen.getByLabelText(/Price \*/i), { target: { value: '3.00' } });

    fireEvent.click(screen.getByRole('button', { name: /Update Drink/i }));

    // Expect notification
    await waitFor(() => {
      expect(screen.getByText('Drink updated successfully!')).toBeInTheDocument();
    });

    // Expect the updated drink to be in the list
    expect(screen.getByText('Espresso (Updated)')).toBeInTheDocument();
    expect(screen.getByText('$3.00')).toBeInTheDocument();
    expect(screen.queryByText('Espresso', { exact: true })).not.toBeInTheDocument(); // Original name should be gone
  });

  // Test 7: Delete a drink with confirmation
  test('deletes a drink after confirmation', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Manage Drinks/i }));

    // Find the "Delete" button for Espresso
    const espressoCard = screen.getByText('Espresso').closest('.card') as HTMLElement;
    fireEvent.click(screen.getByRole('button', { name: /Delete drink/i, container: espressoCard }));

    // Expect confirmation dialog
    expect(screen.getByText('Are you sure you want to delete this drink?')).toBeInTheDocument();

    // Confirm deletion
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    // Expect notification
    await waitFor(() => {
      expect(screen.getByText('Drink deleted successfully!')).toBeInTheDocument();
    });

    // Expect Espresso to be removed from the list
    expect(screen.queryByText('Espresso')).not.toBeInTheDocument();
  });

  // Test 8: Deactivate/Activate a drink
  test('can deactivate and reactivate a drink', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Manage Drinks/i }));

    // Find the "Deactivate" button for Espresso
    const espressoCard = screen.getByText('Espresso').closest('.card') as HTMLElement;
    const deactivateButton = screen.getByRole('button', { name: /Deactivate/i, container: espressoCard });
    expect(deactivateButton).toBeInTheDocument(); // Initially active

    fireEvent.click(deactivateButton);
    expect(espressoCard).toHaveClass('opacity-60'); // Check visual change for inactive
    expect(screen.getByRole('button', { name: /Activate/i, container: espressoCard })).toBeInTheDocument();

    // Reactivate
    fireEvent.click(screen.getByRole('button', { name: /Activate/i, container: espressoCard }));
    expect(espressoCard).not.toHaveClass('opacity-60'); // Check visual change for active
    expect(screen.getByRole('button', { name: /Deactivate/i, container: espressoCard })).toBeInTheDocument();
  });

  // Test 9: Filter feedback in Analytics view
  test('filters feedback based on search term', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Analytics/i }));

    // Initially, all sample feedbacks are displayed (3 of them)
    expect(screen.getByText('Feedback Details (3)')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Mike Johnson')).toBeInTheDocument();

    // Search for "John"
    fireEvent.change(screen.getByLabelText(/Search/i), { target: { value: 'John' } });

    // Only John Doe's feedback should remain
    expect(screen.getByText('Feedback Details (1)')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Mike Johnson')).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(screen.getByLabelText(/Search/i), { target: { value: '' } });
    expect(screen.getByText('Feedback Details (3)')).toBeInTheDocument();
  });

  // Test 10: Export data
  test('exports data successfully', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));

    // Mock createObjectURL and revokeObjectURL
    const createElementSpy = jest.spyOn(document, 'createElement');
    const appendChildSpy = jest.spyOn(document.body, 'appendChild');
    const removeChildSpy = jest.spyOn(document.body, 'removeChild');

    fireEvent.click(screen.getByRole('button', { name: /Export Data/i }));

    // Expect success notification
    await waitFor(() => {
      expect(screen.getByText('Data exported successfully!')).toBeInTheDocument();
    });

    // Verify a link element was created and clicked
    expect(createElementSpy).toHaveBeenCalledWith('a');
    const mockLink = createElementSpy.mock.results[0].value as HTMLAnchorElement;
    expect(mockLink.getAttribute('href')).toMatch(/^data:application\/json/);
    expect(mockLink.getAttribute('download')).toMatch(/^cafe-feedback-data-/);

    // Clean up
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  // Test 11: Import data
  test('imports data successfully', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));

    const newDrinks = [{ id: '7', name: 'New Imported Drink', category: 'Coffee', description: 'Imported', price: 1.00, isActive: true }];
    const newFeedback = [{ id: '4', drinkId: '7', drinkName: 'New Imported Drink', customerName: 'Importer', rating: 5, comment: 'Good!', category: 'Coffee', timestamp: new Date().toISOString(), sentiment: 'positive' }];

    const fileContent = JSON.stringify({
      drinks: newDrinks,
      feedback: newFeedback,
      categories: [], // Keep categories simple for this test
    });

    const file = new File([fileContent], 'test.json', { type: 'application/json' });

    const importInput = screen.getByLabelText(/Import Data/i).querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(importInput, { target: { files: [file] } });

    // Expect success notification
    await waitFor(() => {
      expect(screen.getByText('Data imported successfully!')).toBeInTheDocument();
    });

    // Check if drinks and feedback are updated
    fireEvent.click(screen.getByRole('button', { name: /Manage Drinks/i }));
    await waitFor(() => {
      expect(screen.getByText('New Imported Drink')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Analytics/i }));
    await waitFor(() => {
      expect(screen.getByText('Importer')).toBeInTheDocument();
    });
  });

  // Test 12: Clear all data with confirmation
  test('clears all data after confirmation', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));

    fireEvent.click(screen.getByRole('button', { name: /Clear All Data/i }));

    // Expect confirmation dialog
    expect(screen.getByText('Are you sure you want to clear all data? This action cannot be undone.')).toBeInTheDocument();

    // Confirm clearing
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    // Expect notification
    await waitFor(() => {
      expect(screen.getByText('All data cleared successfully!')).toBeInTheDocument();
    });

    // Verify data is cleared by navigating to other views
    fireEvent.click(screen.getByRole('button', { name: /Manage Drinks/i }));
    expect(screen.queryByText('Espresso')).not.toBeInTheDocument(); // Initial drink should be gone

    fireEvent.click(screen.getByRole('button', { name: /Analytics/i }));
    expect(screen.getByText('No feedback matches your current filters.')).toBeInTheDocument();
  });
});
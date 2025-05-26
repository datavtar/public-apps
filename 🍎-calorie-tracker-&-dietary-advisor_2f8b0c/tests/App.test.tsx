import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the auth context
const mockAuthContextValue = {
  currentUser: {
    uid: 'test-user-uid',
    email: 'test@example.com',
    first_name: 'Test',
  },
  logout: jest.fn(),
};

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    clear() {
      store = {};
    },
    removeItem(key: string) {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the AILayer component and its ref
jest.mock('../src/components/AILayer', () => {
  const MockAILayer = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      sendToAI: (prompt: string, file: File) => {
        // Mock AI response
        props.onResult(JSON.stringify({
          foods: [{
            name: 'Mock Food',
            calories: 100,
            protein: 10,
            carbs: 20,
            fat: 30,
            fiber: 40,
            sugar: 50,
            sodium: 60,
            advantages: ['Mock Advantage'],
            disadvantages: ['Mock Disadvantage'],
            recommendations: ['Mock Recommendation']
          }]
        }));
        props.onLoading(false);
      },
    }));

    return <div data-testid="ai-layer-mock">Mock AILayer</div>;
  });
  return MockAILayer;
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
    expect(screen.getByText('NutriScan')).toBeInTheDocument();
  });

  test('navigates to the upload tab and uploads an image', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText('Upload'));

    const file = new File(['(pseudo-content)'], 'test.png', { type: 'image/png' });
    const input = screen.getByRole('button', { name: /upload image/i }).parentElement?.querySelector('input[type="file"]');
    
    if (input) {
      fireEvent.change(input, { target: { files: [file] } });
    
      await waitFor(() => {
        expect(screen.getByAltText('Uploaded food')).toBeInTheDocument();
      });
    }
  });

  test('analyzes food after uploading an image', async () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText('Upload'));

    const file = new File(['(pseudo-content)'], 'test.png', { type: 'image/png' });
    const input = screen.getByRole('button', { name: /upload image/i }).parentElement?.querySelector('input[type="file"]');
    
    if (input) {
      fireEvent.change(input, { target: { files: [file] } });
    
      await waitFor(() => {
        expect(screen.getByAltText('Uploaded food')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Analyze Food'));

      await waitFor(() => {
        expect(screen.getByText('Food Log')).toBeInTheDocument();
      });
    }
  });

  test('adds and removes a health condition', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText('Food Log'));
    fireEvent.click(screen.getByRole('button', { name: /^Health Condition$/i }));
    fireEvent.click(screen.getByRole('button', { name: 'mild' }));

    expect(screen.getByText('Diabetes (mild)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '×' }));

    expect(screen.queryByText('Diabetes (mild)')).toBeNull();
  });

  test('exports data', () => {
    const mockCreateObjectURL = jest.fn();
    const mockRevokeObjectURL = jest.fn();

    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    const mockClick = jest.fn();
    const mockAppendChild = jest.fn();

    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(() => ({
      href: '',
      download: '',
      click: mockClick,
      appendChild: mockAppendChild,
    } as any));
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText('Food Log'));
    fireEvent.click(screen.getByText('Export CSV'));

    expect(createElementSpy).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();

    createElementSpy.mockRestore();
  });
});

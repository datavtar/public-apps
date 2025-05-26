import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

// Mock the authContext
jest.mock('../src/contexts/authContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-uid', email: 'test@example.com', first_name: 'Test' },
    logout: jest.fn(),
  }),
}));

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

// Mock AILayer component
jest.mock('../src/components/AILayer', () => {
  return {
    __esModule: true,
    default: React.forwardRef((props, ref) => {
      return (<div data-testid="ai-layer-mock">AILayer Mock</div>);
    }),
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders Fruit Vendor Management title', () => {
    render(<App />);
    expect(screen.getByText('फळविक्रेता व्यवस्थापन')).toBeInTheDocument();
  });

  test('renders the dashboard by default', () => {
    render(<App />);
    expect(screen.getByText('आजचा विक्री')).toBeInTheDocument();
  });

  test('renders inventory when inventory tab is clicked', async () => {
    render(<App />);

    const inventoryTab = screen.getByText('साठा');
    inventoryTab.click();

    expect(screen.getByText('फळांचा साठा (Inventory)')).toBeInTheDocument();
  });

  test('renders sales when sales tab is clicked', async () => {
    render(<App />);

    const salesTab = screen.getByText('विक्री');
    salesTab.click();

    expect(screen.getByText('विक्री रेकॉर्ड (Sales)')).toBeInTheDocument();
  });

  test('renders customers when customers tab is clicked', async () => {
    render(<App />);

    const customersTab = screen.getByText('ग्राहक');
    customersTab.click();

    expect(screen.getByText('ग्राहक (Customers)')).toBeInTheDocument();
  });

  test('renders AI Assistant when AI tab is clicked', async () => {
    render(<App />);

    const aiTab = screen.getByText('AI सहायक');
    aiTab.click();

    expect(screen.getByText('AI सहायक (AI Assistant)')).toBeInTheDocument();
    expect(screen.getByTestId('ai-layer-mock')).toBeInTheDocument();
  });
});
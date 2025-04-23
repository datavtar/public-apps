import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

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

// Mock the generateId function
const mockGenerateId = jest.fn(() => 'mocked-id');
jest.mock('../src/App', () => {
  const originalModule = jest.requireActual('../src/App');
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn().mockImplementation(() => {
      return React.createElement(originalModule.default, {
        generateId: mockGenerateId,
      });
    }),
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('ફળ અને શાકભાજી મેનેજમેન્ટ')).toBeInTheDocument();
  });

  it('navigates to products view', async () => {
    render(<App />);
    const productsButton = screen.getByRole('button', { name: /ઉત્પાદનો/i });
    fireEvent.click(productsButton);
    expect(screen.getByText('ઉત્પાદન સૂચિ')).toBeInTheDocument();
  });

  it('navigates to sales view', async () => {
    render(<App />);
    const salesButton = screen.getByRole('button', { name: /વેચાણ/i });
    fireEvent.click(salesButton);
    expect(screen.getByText('વેચાણ સૂચિ')).toBeInTheDocument();
  });

  it('navigates to dashboard view', async () => {
    render(<App />);
    const dashboardButton = screen.getByRole('button', { name: /ડેશબોર્ડ/i });
    fireEvent.click(dashboardButton);
    expect(screen.getByText('વેચાણ ડેશબોર્ડ')).toBeInTheDocument();
  });

  it('adds a new product', async () => {
    render(<App />);
    // Go to products view
    fireEvent.click(screen.getByRole('button', { name: /ઉત્પાદનો/i }));

    // Open the add product modal
    const addProductButton = screen.getByRole('button', { name: /નવું ઉત્પાદન/i });
    fireEvent.click(addProductButton);

    // Fill out the form
    const nameInput = screen.getByLabelText('નામ') as HTMLInputElement;
    const priceInput = screen.getByLabelText('કિંમત (₹)') as HTMLInputElement;
    const stockInput = screen.getByLabelText('સ્ટોક') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Test Product' } });
    fireEvent.change(priceInput, { target: { value: '50' } });
    fireEvent.change(stockInput, { target: { value: '100' } });

    // Submit the form
    const saveButton = screen.getByRole('button', { name: /સાચવો/i });
    fireEvent.click(saveButton);

    // Assert that the product is added
    expect(await screen.findByText('Test Product')).toBeInTheDocument();
  });
});

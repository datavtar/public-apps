import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

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


describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
  });

  test('renders calculator component', () => {
    render(<App />);
    expect(screen.getByText('Calculator')).toBeInTheDocument();
    expect(screen.getByTestId('display')).toBeInTheDocument();
  });

  test('initial display is 0', () => {
    render(<App />);
    expect(screen.getByTestId('display')).toHaveTextContent('0');
  });

  test('entering digits updates the display', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('one'));
    expect(screen.getByTestId('display')).toHaveTextContent('1');

    fireEvent.click(screen.getByTestId('two'));
    expect(screen.getByTestId('display')).toHaveTextContent('12');
  });

  test('clear button resets the display to 0', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('one'));
    fireEvent.click(screen.getByTestId('clear'));
    expect(screen.getByTestId('display')).toHaveTextContent('0');
  });

  test('decimal button adds a decimal point', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('decimal'));
    expect(screen.getByTestId('display')).toHaveTextContent('0.');

    fireEvent.click(screen.getByTestId('one'));
    expect(screen.getByTestId('display')).toHaveTextContent('0.1');
  });

  test('addition operation works correctly', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('one'));
    fireEvent.click(screen.getByTestId('add'));
    fireEvent.click(screen.getByTestId('two'));
    fireEvent.click(screen.getByTestId('equals'));
    expect(screen.getByTestId('display')).toHaveTextContent('3');
  });

  test('subtraction operation works correctly', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('four'));
    fireEvent.click(screen.getByTestId('subtract'));
    fireEvent.click(screen.getByTestId('one'));
    fireEvent.click(screen.getByTestId('equals'));
    expect(screen.getByTestId('display')).toHaveTextContent('3');
  });

  test('multiplication operation works correctly', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('two'));
    fireEvent.click(screen.getByTestId('multiply'));
    fireEvent.click(screen.getByTestId('three'));
    fireEvent.click(screen.getByTestId('equals'));
    expect(screen.getByTestId('display')).toHaveTextContent('6');
  });

  test('division operation works correctly', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('six'));
    fireEvent.click(screen.getByTestId('divide'));
    fireEvent.click(screen.getByTestId('two'));
    fireEvent.click(screen.getByTestId('equals'));
    expect(screen.getByTestId('display')).toHaveTextContent('3');
  });

  test('division by zero results in 0', () => {
      render(<App />);
      fireEvent.click(screen.getByTestId('one'));
      fireEvent.click(screen.getByTestId('divide'));
      fireEvent.click(screen.getByTestId('zero'));
      fireEvent.click(screen.getByTestId('equals'));
      expect(screen.getByTestId('display')).toHaveTextContent('0');
  });

  test('history toggle button works', () => {
    render(<App />);
    const historyToggle = screen.getByTestId('history-toggle');
    fireEvent.click(historyToggle);
    expect(screen.getByText('Calculation History')).toBeVisible();

    fireEvent.click(historyToggle);
    expect(screen.queryByText('Calculation History')).toBeNull();
  });

  test('clear history button works', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('one'));
    fireEvent.click(screen.getByTestId('add'));
    fireEvent.click(screen.getByTestId('two'));
    fireEvent.click(screen.getByTestId('equals'));

    fireEvent.click(screen.getByTestId('history-toggle'));
    expect(screen.getByText('Clear All')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('clear-history'));
    expect(screen.getByText('No calculations yet')).toBeInTheDocument();
  });

  test('theme toggle button works', () => {
    render(<App />);
    const themeToggle = screen.getByTestId('theme-toggle');
    fireEvent.click(themeToggle);
    expect(localStorageMock.getItem('calculatorDarkMode')).toBe('true');
    fireEvent.click(themeToggle);
    expect(localStorageMock.getItem('calculatorDarkMode')).toBe('false');
  });

  test('history items are displayed correctly and can be used', async () => {
    render(<App />);
    // Perform a calculation to add to history
    fireEvent.click(screen.getByTestId('one'));
    fireEvent.click(screen.getByTestId('add'));
    fireEvent.click(screen.getByTestId('two'));
    fireEvent.click(screen.getByTestId('equals'));

    // Open history
    fireEvent.click(screen.getByTestId('history-toggle'));

    // Check if the history item is displayed
    expect(screen.getByTestId('history-item-0')).toBeInTheDocument();

    // Click the history item
    fireEvent.click(screen.getByTestId('history-item-0'));

    // Check if the display is updated with the history item's result
    expect(screen.getByTestId('display')).toHaveTextContent('3');
  });
});
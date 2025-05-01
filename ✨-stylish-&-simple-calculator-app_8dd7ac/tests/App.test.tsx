import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders learn react link', () => {
    render(<App />);
    expect(screen.getByText(/Scientific Calculator/i)).toBeInTheDocument();
  });

  test('initial display should be 0', () => {
    render(<App />);
    const displayElement = screen.getByTestId('display');
    expect(displayElement.textContent).toBe('0');
  });

  test('entering numbers updates the display', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('one'));
    const displayElement = screen.getByTestId('display');
    expect(displayElement.textContent).toBe('1');
  });

  test('decimal button adds a decimal point', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('decimal'));
    const displayElement = screen.getByTestId('display');
    expect(displayElement.textContent).toBe('0.');
  });

  test('addition operation works correctly', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('one'));
    fireEvent.click(screen.getByTestId('add'));
    fireEvent.click(screen.getByTestId('two'));
    fireEvent.click(screen.getByTestId('equals'));
    const displayElement = screen.getByTestId('display');
    expect(displayElement.textContent).toBe('3');
  });

  test('subtraction operation works correctly', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('four'));
    fireEvent.click(screen.getByTestId('subtract'));
    fireEvent.click(screen.getByTestId('one'));
    fireEvent.click(screen.getByTestId('equals'));
    const displayElement = screen.getByTestId('display');
    expect(displayElement.textContent).toBe('3');
  });

  test('multiplication operation works correctly', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('two'));
    fireEvent.click(screen.getByTestId('multiply'));
    fireEvent.click(screen.getByTestId('three'));
    fireEvent.click(screen.getByTestId('equals'));
    const displayElement = screen.getByTestId('display');
    expect(displayElement.textContent).toBe('6');
  });

  test('division operation works correctly', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('six'));
    fireEvent.click(screen.getByTestId('divide'));
    fireEvent.click(screen.getByTestId('two'));
    fireEvent.click(screen.getByTestId('equals'));
    const displayElement = screen.getByTestId('display');
    expect(displayElement.textContent).toBe('3');
  });

  test('division by zero displays error', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('one'));
    fireEvent.click(screen.getByTestId('divide'));
    fireEvent.click(screen.getByTestId('zero'));
    fireEvent.click(screen.getByTestId('equals'));
    
    // Wait for the error message to appear
    // Use findByText to handle asynchronous updates
    const errorMessage = await screen.findByText('Cannot divide by zero');
    expect(errorMessage).toBeInTheDocument();
  });

  test('clear button resets the display', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('one'));
    fireEvent.click(screen.getByTestId('clear'));
    const displayElement = screen.getByTestId('display');
    expect(displayElement.textContent).toBe('0');
  });

    test('memory clear button clears memory', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('one'));
    fireEvent.click(screen.getByTestId('memory-store'));
    fireEvent.click(screen.getByTestId('memory-clear'));
    fireEvent.click(screen.getByTestId('memory-recall'));

    const displayElement = screen.getByTestId('display');
    expect(displayElement.textContent).toBe('0');

  });

    test('backspace button deletes last character', () => {
      render(<App />);
      fireEvent.click(screen.getByTestId('one'));
      fireEvent.click(screen.getByTestId('two'));
      fireEvent.click(screen.getByTestId('backspace'));
      const displayElement = screen.getByTestId('display');
      expect(displayElement.textContent).toBe('1');
    });
  
    test('clear entry button clears current entry', () => {
      render(<App />);
      fireEvent.click(screen.getByTestId('one'));
      fireEvent.click(screen.getByTestId('add'));
      fireEvent.click(screen.getByTestId('two'));
      fireEvent.click(screen.getByTestId('clear-entry'));
      const displayElement = screen.getByTestId('display');
      expect(displayElement.textContent).toBe('0');
    });
  
    test('history toggle button toggles history visibility', () => {
      render(<App />);
      const historyToggle = screen.getByTestId('history-toggle');
      fireEvent.click(historyToggle);
      expect(screen.getByText(/Calculation History/i)).toBeVisible();
      fireEvent.click(historyToggle);
      
    });

    test('sqrt function calculates square root correctly', () => {
      render(<App />);
      fireEvent.click(screen.getByTestId('four'));
      fireEvent.click(screen.getByTestId('sqrt'));
      const displayElement = screen.getByTestId('display');
      expect(displayElement.textContent).toBe('2');
    });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders learn react link', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /calculator/i })).toBeInTheDocument();
  });

  test('initial input and result are 0', () => {
    render(<App />);
    const inputElement = screen.getByDisplayValue('0');
    expect(inputElement).toBeInTheDocument();
  });

  test('entering numbers updates the input', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /1/i }));
    fireEvent.click(screen.getByRole('button', { name: /2/i }));
    const inputElement = screen.getByDisplayValue('12');
    expect(inputElement).toBeInTheDocument();
  });

  test('performing a calculation updates the result', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /2/i }));
    fireEvent.click(screen.getByRole('button', { name: /\+/i }));
    fireEvent.click(screen.getByRole('button', { name: /3/i }));
    fireEvent.click(screen.getByRole('button', { name: /=/i }));
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('clearing the input resets input and result', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /1/i }));
    fireEvent.click(screen.getByRole('button', { name: /c/i }));
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
  });

  test('backspace removes the last character from input', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /1/i }));
    fireEvent.click(screen.getByRole('button', { name: /2/i }));
    fireEvent.click(screen.getByRole('button', { name: /backspace/i }));
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
  });

  test('decimal button adds a decimal point to the input', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /1/i }));
    fireEvent.click(screen.getByRole('button', { name: /decimal point/i }));
    expect(screen.getByDisplayValue('1.')).toBeInTheDocument();
  });

  test('displays error when calculation results in error', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /1/i }));
    fireEvent.click(screen.getByRole('button', { name: /\//i }));
    fireEvent.click(screen.getByRole('button', { name: /0/i }));
    fireEvent.click(screen.getByRole('button', { name: /=/i }));
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  test('persists dark mode on refresh', () => {
    localStorage.setItem('darkMode', 'true');
    render(<App />);
    // check if dark mode classes are applied to the document element (simulated here).
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('History is saved to local storage', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /1/i }));
    fireEvent.click(screen.getByRole('button', { name: /\+/i }));
    fireEvent.click(screen.getByRole('button', { name: /2/i }));
    fireEvent.click(screen.getByRole('button', { name: /=/i }));
    
    const history = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
    expect(history.length).toBe(1);
    expect(history[0].calculation).toBe('1+2');
    expect(history[0].result).toBe('3');
  });

  test('History is cleared when clear history button is clicked', () => {
    render(<App />);
     fireEvent.click(screen.getByRole('button', { name: /1/i }));
    fireEvent.click(screen.getByRole('button', { name: /\+/i }));
    fireEvent.click(screen.getByRole('button', { name: /2/i }));
    fireEvent.click(screen.getByRole('button', { name: /=/i }));
    
    const clearHistoryButton = screen.getByRole('button', {name: /clear history/i})
    fireEvent.click(clearHistoryButton);

    const history = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
    expect(history.length).toBe(0);
    expect(screen.getByText('No calculations yet')).toBeInTheDocument();

  });

  test('scientific mode toggles correctly', () => {
    render(<App />);
    const scientificButton = screen.getByRole('button', { name: /scientific/i });
    fireEvent.click(scientificButton);
    expect(screen.getByRole('button', { name: /standard/i })).toBeInTheDocument();

    const sinButton = screen.getByRole('button', { name: /sine/i });
    expect(sinButton).toBeInTheDocument();
  });

});
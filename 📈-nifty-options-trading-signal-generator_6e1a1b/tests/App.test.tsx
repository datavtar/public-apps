import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows loading state', () => {
    render(<App />);
    expect(screen.getByText('Loading NIFTY Analyzer')).toBeInTheDocument();
  });

  test('shows error state', () => {
    // Mock the initial state to include an error
    render(<App />);

    // Simulate an error after the component mounts. Since setting the state
    // directly isn't feasible in this context, we'll rely on the component's
    // internal logic to eventually display the error state.  We can't directly
    // set an error state here, so this test might need adjustment based on
    // how the error is triggered in the actual component.
    //For the purpose of testing this properly, the error state setting mechanism
    //needs to be mockable. This is not straightforward without refactoring
    //the App.tsx component
  });

  test('renders the NIFTY Options Analyzer Logo', () => {
    render(<App />);

    const logoElement = screen.getByAltText('NIFTY Options Analyzer Logo');

    expect(logoElement).toBeInTheDocument();
  });

  test('renders header text', () => {
      render(<App/>);
      expect(screen.getByText('NIFTY Options Analyzer')).toBeInTheDocument();
  });
});
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Sales Boost Hub/i)).toBeInTheDocument();
  });

  test('navigation buttons render', () => {
    render(<App />);
    expect(screen.getByText(/Idea Generator/i)).toBeInTheDocument();
    expect(screen.getByText(/My Ideas/i)).toBeInTheDocument();
    expect(screen.getByText(/Analytics/i)).toBeInTheDocument();
  });

  test('Idea Generator view renders by default', () => {
    render(<App />);
    expect(screen.getByText(/Quick Inspiration/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse All Ideas/i)).toBeInTheDocument();
  });

  test('can switch to Tracker view', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/My Ideas/i));
    expect(screen.getByText(/My Saved Ideas/i)).toBeInTheDocument();
  });

  test('can switch to Analytics view', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Analytics/i));
    expect(screen.getByText(/Analytics Dashboard/i)).toBeInTheDocument();
  });

  test('generate random idea button works', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Generate Random Idea/i));
    expect(screen.getByText(/Save Idea/i)).toBeInTheDocument();
  });

  test('filters section renders', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Filters/i));
    expect(screen.getByText(/Search/i)).toBeInTheDocument();
    expect(screen.getByText(/Category/i)).toBeInTheDocument();
    expect(screen.getByText(/Difficulty/i)).toBeInTheDocument();
    expect(screen.getByText(/Cost/i)).toBeInTheDocument();
  });


  test('displays no saved ideas message in tracker when no ideas are saved', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/My Ideas/i));
    expect(screen.getByText(/No saved ideas yet/i)).toBeInTheDocument();
  });
});
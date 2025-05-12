import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);

    expect(screen.getByText(/Teacher's Dashboard/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Students/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Assignments/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analytics/i })).toBeInTheDocument();
  });

  test('displays a list of students initially', () => {
    render(<App />);

    expect(screen.getByText(/Emma Johnson/i)).toBeInTheDocument();
  });

  test('displays a list of assignments initially', async () => {
    render(<App />);

    const assignmentsTab = screen.getByRole('button', { name: /Assignments/i });
    assignmentsTab.click();

    expect(screen.getByText(/Weekly Quiz - Math/i)).toBeInTheDocument();
  });

  test('shows analytics view when analytics tab is clicked', async () => {
      render(<App />);
      const analyticsTab = screen.getByRole('button', { name: /Analytics/i });
      analyticsTab.click();

      expect(screen.getByText(/Total Students/i)).toBeInTheDocument();
  });
});
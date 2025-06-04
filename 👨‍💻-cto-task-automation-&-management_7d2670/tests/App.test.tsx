import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders header with company name', () => {
    render(<App />);
    const headerText = screen.getByText(/Fireflies CTO Dashboard/i);
    expect(headerText).toBeInTheDocument();
  });

  test('renders dashboard view by default', () => {
    render(<App />);
    const teamProductivityText = screen.getByText(/Team Productivity/i);
    expect(teamProductivityText).toBeInTheDocument();
  });

  test('navigates to team view when team link is clicked', async () => {
    render(<App />);
    const teamLink = screen.getByText(/Team/i);
    fireEvent.click(teamLink);
    await waitFor(() => {
      expect(screen.getByText(/Team Management/i)).toBeInTheDocument();
    });
  });

  test('navigates to projects view when projects link is clicked', async () => {
    render(<App />);
    const projectsLink = screen.getByText(/Projects/i);
    fireEvent.click(projectsLink);
    await waitFor(() => {
      expect(screen.getByText(/Project Portfolio/i)).toBeInTheDocument();
    });
  });

  test('navigates to systems view when systems link is clicked', async () => {
    render(<App />);
    const systemsLink = screen.getByText(/Systems/i);
    fireEvent.click(systemsLink);
    await waitFor(() => {
      expect(screen.getByText(/System Monitoring/i)).toBeInTheDocument();
    });
  });

  test('navigates to meetings view when meetings link is clicked', async () => {
    render(<App />);
    const meetingsLink = screen.getByText(/Meetings/i);
    fireEvent.click(meetingsLink);
    await waitFor(() => {
      expect(screen.getByText(/Meeting Insights/i)).toBeInTheDocument();
    });
  });

  test('navigates to tech debt view when tech debt link is clicked', async () => {
    render(<App />);
    const debtLink = screen.getByText(/Tech Debt/i);
    fireEvent.click(debtLink);
    await waitFor(() => {
      expect(screen.getByText(/Technical Debt Management/i)).toBeInTheDocument();
    });
  });

  test('navigates to settings view when settings link is clicked', async () => {
    render(<App />);
    const settingsLink = screen.getByText(/Settings/i);
    fireEvent.click(settingsLink);
    await waitFor(() => {
      expect(screen.getByText(/Settings & Configuration/i)).toBeInTheDocument();
    });
  });

  test('renders AI analysis section in meetings view', async () => {
    render(<App />);
    const meetingsLink = screen.getByText(/Meetings/i);
    fireEvent.click(meetingsLink);
    await waitFor(() => {
      expect(screen.getByText(/AI Meeting Analysis/i)).toBeInTheDocument();
    });
  });

  test('displays error message when AI send button is clicked without prompt or file', async () => {
    render(<App />);
    const meetingsLink = screen.getByText(/Meetings/i);
    fireEvent.click(meetingsLink);
    const analyzeButton = await screen.findByRole('button', { name: /Analyze with AI/i });
    fireEvent.click(analyzeButton);
    await waitFor(() => {
        expect(screen.getByText(/Please provide a prompt or select a file./i)).toBeInTheDocument();
    });
  });


  test('renders settings page', async () => {
    render(<App />);
    const settingsLink = screen.getByText(/Settings/i);
    fireEvent.click(settingsLink);
    await waitFor(() => {
      expect(screen.getByText(/Appearance/i)).toBeInTheDocument();
    });
  });
});
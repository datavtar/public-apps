import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('renders the main heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/🍎 Healthy Meal Planner/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders the calendar view initially', () => {
    render(<App />);
    const calendarButton = screen.getByRole('button', { name: /calendar/i });
    expect(calendarButton).toBeInTheDocument();
  });

    test('renders the analytics view', async () => {
        render(<App />);

        const analyticsButton = screen.getByRole('button', { name: /analytics/i });
        expect(analyticsButton).toBeInTheDocument();
    });


    test('renders the analytics view content', async () => {
        render(<App />);

        const analyticsButton = screen.getByRole('button', { name: /analytics/i });
        analyticsButton.click();

        const weightLossPredictionHeading = await screen.findByText(/Weight Loss Analytics/i)
        expect(weightLossPredictionHeading).toBeInTheDocument();
    });

    test('renders profile button in analytics view', async () => {
        render(<App />);

        const analyticsButton = screen.getByRole('button', { name: /analytics/i });
        analyticsButton.click();

        const profileButton = await screen.findByRole('button', { name: /Update Profile & Goals/i });
        expect(profileButton).toBeInTheDocument();
    });
});

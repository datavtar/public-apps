import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the application layout', () => {
    render(<App />);

    // Check for the presence of the EquityManage title in the sidebar
    const titleElement = screen.getByText(/EquityManage/i);
    expect(titleElement).toBeInTheDocument();

    // Check if the Dashboard link is present
    const dashboardLink = screen.getByText(/Dashboard/i);
    expect(dashboardLink).toBeInTheDocument();

    // Check if the copyright text is present in the footer.
    const copyrightText = screen.getByText(/Copyright \(c\) 2025 of Datavtar Private Limited\. All rights reserved\./i);
    expect(copyrightText).toBeInTheDocument();
  });

  test('renders the Dashboard component by default', async () => {
    render(<App />);

    // Wait for the Dashboard component to render
    const dashboardHeader = await screen.findByText(/Dashboard/i);
    expect(dashboardHeader).toBeInTheDocument();

    // Verify a stat card is present
    const totalAUMElement = await screen.findByText(/Total AUM/i)
    expect(totalAUMElement).toBeInTheDocument();
  });


  test('navigation links are working', async () => {
    render(<App />);

    const fundsLink = screen.getByText(/Funds/i);
    expect(fundsLink).toBeInTheDocument();
  });
});
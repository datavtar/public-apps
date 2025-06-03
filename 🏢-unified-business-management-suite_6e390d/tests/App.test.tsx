import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the App component', () => {
    render(<App />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  test('renders dashboard with key metrics', async () => {
    render(<App />);

    // Wait for data to load.  Adjust timeout if necessary.
    await screen.findByText(/Total Revenue/, { timeout: 5000 });

    expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Customers/i)).toBeInTheDocument();
  });

  test('CRM module renders with Add Contact button', async () => {
    render(<App />);

    // Navigate to CRM module
    const crmButton = screen.getByText(/CRM/i);
    crmButton.click();

    // Wait for data to load and button to render
    await screen.findByText(/Add Contact/, { timeout: 5000 });

    expect(screen.getByText(/Add Contact/i)).toBeInTheDocument();
  });

  test('HR module renders with Add Employee button', async () => {
    render(<App />);

    // Navigate to HR module
    const hrButton = screen.getByText(/HR/i);
    hrButton.click();

    // Wait for data to load and button to render
    await screen.findByText(/Add Employee/, { timeout: 5000 });

    expect(screen.getByText(/Add Employee/i)).toBeInTheDocument();
  });

  test('Help Desk module renders with Create Ticket button', async () => {
    render(<App />);

    // Navigate to Help Desk module
    const helpDeskButton = screen.getByText(/Help Desk/i);
    helpDeskButton.click();

    // Wait for data to load and button to render
    await screen.findByText(/Create Ticket/, { timeout: 5000 });

    expect(screen.getByText(/Create Ticket/i)).toBeInTheDocument();
  });

  test('Projects module renders with New Project button', async () => {
    render(<App />);

    // Navigate to Projects module
    const projectsButton = screen.getByText(/Projects/i);
    projectsButton.click();

    // Wait for data to load and button to render
    await screen.findByText(/New Project/, { timeout: 5000 });

    expect(screen.getByText(/New Project/i)).toBeInTheDocument();
  });

  test('Inventory module renders with Add Item button', async () => {
    render(<App />);

    // Navigate to Inventory module
    const inventoryButton = screen.getByText(/Inventory/i);
    inventoryButton.click();

    // Wait for data to load and button to render
    await screen.findByText(/Add Item/, { timeout: 5000 });

    expect(screen.getByText(/Add Item/i)).toBeInTheDocument();
  });

  test('Settings module renders with export all data button', async () => {
    render(<App />);

    // Navigate to Settings module
    const settingsButton = screen.getByText(/Settings/i);
    settingsButton.click();

    // Wait for data to load and button to render
    await screen.findByText(/Export All Data/, { timeout: 5000 });

    expect(screen.getByText(/Export All Data/i)).toBeInTheDocument();
  });
});
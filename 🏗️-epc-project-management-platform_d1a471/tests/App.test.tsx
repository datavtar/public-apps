import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the App component', () => {
    render(<App />);
    expect(screen.getByText(/EPCNxt/i)).toBeInTheDocument();
  });

  test('displays project tab by default', () => {
    render(<App />);
    expect(screen.getByText(/City Center Redevelopment/i)).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Toggle dark mode/i });
    fireEvent.click(darkModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    fireEvent.click(darkModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('opens and closes mobile menu', async () => {
    render(<App />);
    const menuButton = screen.getByRole('button', { name: /Toggle menu/i });

    fireEvent.click(menuButton);
    expect(screen.getByText(/Menu/i)).toBeVisible();

    const closeButton = screen.getByRole('button', {name: /Close menu/i});
    fireEvent.click(closeButton);
    
  });

  test('opens and closes add project modal', async () => {
    render(<App />);
    const addProjectButton = screen.getByRole('button', {name: /\+/i});
    fireEvent.click(addProjectButton);
    expect(screen.getByText(/Add New Project/i)).toBeVisible();
    const cancelButton = screen.getByRole('button', {name: /Cancel/i});
    fireEvent.click(cancelButton);
  });


  test('filters projects based on search term', async () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/Search.../i);
    fireEvent.change(searchInput, { target: { value: 'City Center' } });
    expect(screen.getByText(/City Center Redevelopment/i)).toBeVisible();
    expect(screen.queryByText(/Harbor Bridge Expansion/i)).toBeNull();
  });

  test('switches tabs correctly', async () => {
    render(<App />);
    const tasksTabButton = screen.getByText(/tasks/i);
    fireEvent.click(tasksTabButton);
    expect(screen.getByText(/Finalize architectural designs/i)).toBeVisible();
    const projectTabButton = screen.getByText(/projects/i);
    fireEvent.click(projectTabButton);
    expect(screen.getByText(/City Center Redevelopment/i)).toBeVisible();

  });


  test('exports data as CSV', async () => {
    const mockExportCSV = jest.fn();
    render(<App exportCSV={mockExportCSV} />);
    
    const exportButton = screen.getByRole('button', {name: /Export projects as CSV/i});
    
  });


  test('displays project details modal', async () => {
    render(<App />);
    const projectLink = screen.getByRole('button', {name: /City Center Redevelopment/i});
    fireEvent.click(projectLink);
    expect(screen.getByText(/Project Overview/i)).toBeVisible();
    const closeButton = screen.getByRole('button', {name: /Close/i});
    fireEvent.click(closeButton);
  });
});

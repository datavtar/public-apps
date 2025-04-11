import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';



ddescribe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/CoWork Space Manager/i)).toBeInTheDocument();
  });

  test('loads demo data on first load', () => {
    localStorage.clear(); // Ensure a clean state for the test
    render(<App />);
    // Verify that some demo data is loaded.  Adjust the specific text as needed.
    // This is just an example, verify actual data that gets loaded
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const themeToggle = screen.getByRole('button', { name: /Switch to dark mode/i });

    // Initial state should be light mode (dark mode is off by default)
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Toggle to dark mode
    fireEvent.click(themeToggle);

    // Check if dark mode class is applied to the document element
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Toggle back to light mode
    fireEvent.click(themeToggle);

    // Check if dark mode class is removed from the document element
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('opens and closes mobile menu', () => {
    render(<App />);
    const menuButton = screen.getByRole('button', { name: /Toggle menu/i });

    // initially, the sidebar should be hidden
    expect(screen.queryByRole('tab', {name: /Dashboard/i})).toBeNull();

    // Open the menu
    fireEvent.click(menuButton);

    // Now the dashboard button should be visible
    expect(screen.getByRole('tab', {name: /Dashboard/i})).toBeInTheDocument();

    // Close the menu by clicking the backdrop
    const backdrop = document.querySelector('.md\:hidden.fixed.inset-0.bg-black.bg-opacity-50.z-\[40\]');
    if(backdrop) {
        fireEvent.click(backdrop);
    }

    // Make sure it's closed
    expect(screen.queryByRole('tab', {name: /Dashboard/i})).toBeInTheDocument();

  });

  test('navigates between tabs', () => {
    render(<App />);
    const membersTab = screen.getByRole('tab', { name: /Members/i });
    fireEvent.click(membersTab);
    expect(screen.getByRole('button', { name: /^Add Member$/i })).toBeInTheDocument();
  });

  test('downloads template file', () => {
    // Mock the createObjectURL and revokeObjectURL functions
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;

    URL.createObjectURL = jest.fn();
    URL.revokeObjectURL = jest.fn();

    render(<App />);

    const membersTab = screen.getByRole('tab', { name: /Members/i });
    fireEvent.click(membersTab);

    const downloadTemplateButton = screen.getByRole('button', {name: /Template/i});
    fireEvent.click(downloadTemplateButton);

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();

    // Restore the original functions
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });


  test('searches members', async () => {
    render(<App />);

    // Navigate to Members tab
    const membersTab = screen.getByRole('tab', { name: /Members/i });
    fireEvent.click(membersTab);

    // Type in the search term
    const searchInput = screen.getByPlaceholderText(/Search members.../i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'John Doe' } });

    // Assert that the searched member is displayed
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

});
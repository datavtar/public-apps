import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';
import { BrowserRouter } from 'react-router-dom';



describe('App Component', () => {
  test('renders the component', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText(/EquityPro/i)).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const themeToggle = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(themeToggle);

    expect(themeToggle).toHaveAttribute('aria-label', 'Switch to light mode');

    fireEvent.click(screen.getByRole('button', { name: /Switch to light mode/i }));
    expect(themeToggle).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  test('navigates to portfolio page', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const portfolioLink = screen.getByText(/Portfolio/i);
    expect(portfolioLink).toBeInTheDocument();
  });

  test('opens and closes the sidebar on mobile', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const openSidebarButton = screen.getByRole('button', { name: /Open sidebar/i });
    fireEvent.click(openSidebarButton);

    const closeSidebarButton = screen.getByRole('button', { name: /Close sidebar/i });
    expect(closeSidebarButton).toBeInTheDocument();

    fireEvent.click(closeSidebarButton);
  });
});
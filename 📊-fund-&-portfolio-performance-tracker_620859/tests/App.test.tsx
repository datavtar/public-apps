import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});



describe('App Component', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the component', () => {
    render(<App />);

    // Check for the main heading
    expect(screen.getByText(/Private Equity Portfolio Monitor/i)).toBeInTheDocument();
  });

  it('renders the dashboard tab by default', () => {
    render(<App />);
    expect(screen.getByText(/Total AUM/i)).toBeInTheDocument();
  });

  it('navigates to the Funds tab', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Funds/i));
    await waitFor(() => {
      expect(screen.getByText(/Add Fund/i)).toBeInTheDocument();
    });
  });

  it('navigates to the Portfolio Companies tab', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Portfolio Companies/i));
    await waitFor(() => {
      expect(screen.getByText(/Add Company/i)).toBeInTheDocument();
    });
  });

  it('navigates to the Performance tab', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Performance/i));
    await waitFor(() => {
      expect(screen.getByText(/Performance Analysis/i)).toBeInTheDocument();
    });
  });

  it('opens and closes the Add Fund modal', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Funds/i));
    const addFundButton = await screen.findByRole('button', { name: /^Add Fund$/i });
    fireEvent.click(addFundButton);
    await waitFor(() => {
      expect(screen.getByText(/Add New Fund/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText(/Add New Fund/i)).not.toBeInTheDocument();
    });
  });

  it('opens and closes the Add Company modal', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Portfolio Companies/i));
    const addCompanyButton = await screen.findByRole('button', { name: /^Add Company$/i });
    fireEvent.click(addCompanyButton);

    await waitFor(() => {
      expect(screen.getByText(/Add New Company/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText(/Add New Company/i)).not.toBeInTheDocument();
    });
  });

  it('toggles dark mode', () => {
    render(<App />);
    const themeToggleButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(themeToggleButton);
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
  });

  it('adds a new fund', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Funds/i));
    const addFundButton = await screen.findByRole('button', { name: /^Add Fund$/i });

    fireEvent.click(addFundButton);

    fireEvent.change(screen.getByLabelText(/Fund Name/i), { target: { value: 'Test Fund' } });
    fireEvent.change(screen.getByLabelText(/AUM \(in millions \$\)/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Vintage Year/i), { target: { value: '2020' } });
    fireEvent.change(screen.getByLabelText(/Strategy/i), { target: { value: 'Test Strategy' } });
    fireEvent.change(screen.getByLabelText(/IRR \(\%\)/i), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText(/MOIC/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Distributions \(in millions \$\)/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'active' } });

    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(screen.getByText(/Test Fund/i)).toBeInTheDocument();
    });
  });
});

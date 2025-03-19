import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';




// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});




describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders procurement orders after loading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Cement')).toBeInTheDocument();
      expect(screen.getByText('Steel Rods')).toBeInTheDocument();
    });
  });

  test('adds a new order', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Cement')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add Order' }));

    fireEvent.change(screen.getByRole('textbox', { name: 'item' }), { target: { value: 'New Item' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'quantity' }), { target: { value: '5' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'supplier' }), { target: { value: 'New Supplier' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'orderDate' }), { target: { value: '2024-11-15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('New Item')).toBeInTheDocument();
    });
  });

 test('filters orders by status', async () => {
    render(<App />);

    await waitFor(() => {
        expect(screen.getByText('Cement')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Pending' } });

    await waitFor(() => {
      // Check that only 'Pending' orders are displayed after filtering.
      // Since the initial data contains only one pending order (Bricks),
      // we expect only that order to be present.
      expect(screen.queryByText('Cement')).not.toBeInTheDocument();
      expect(screen.queryByText('Steel Rods')).not.toBeInTheDocument();
      expect(screen.getByText('Bricks')).toBeInTheDocument();
    });
 });

  test('searches orders by item', async () => {
    render(<App />);

    await waitFor(() => {
        expect(screen.getByText('Cement')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Cement' } });

    await waitFor(() => {
      expect(screen.getByText('Cement')).toBeInTheDocument();
      expect(screen.queryByText('Steel Rods')).not.toBeInTheDocument();
    });
  });

  test('toggles dark mode', async () => {
    render(<App />);

    const themeToggle = screen.getByRole('switch', { name: 'themeToggle' });
    expect(localStorageMock.getItem('darkMode')).toBeFalsy();

    fireEvent.click(themeToggle);

    expect(localStorageMock.getItem('darkMode')).toBe('true');

    fireEvent.click(themeToggle);
    expect(localStorageMock.getItem('darkMode')).toBe('false');
  });


  test('edits an existing order', async () => {
        render(<App />);

        await waitFor(() => {
            expect(screen.getByText('Cement')).toBeInTheDocument();
        });

        fireEvent.click(screen.getAllByRole('button', {name: /editorder/i})[0]);

        await waitFor(() => {
            expect(screen.getByRole('textbox', {name: 'item'})).toHaveValue('Cement');
        });

        fireEvent.change(screen.getByRole('textbox', {name: 'item'}), {target: {value: 'Updated Cement'}});
        fireEvent.click(screen.getByRole('button', {name: 'Save'}));

        await waitFor(() => {
            expect(screen.getByText('Updated Cement')).toBeInTheDocument();
            expect(screen.queryByText('Cement')).not.toBeInTheDocument();
        });
    });

    test('deletes an existing order', async () => {
        render(<App />);

        await waitFor(() => {
            expect(screen.getByText('Cement')).toBeInTheDocument();
        });

        fireEvent.click(screen.getAllByRole('button', {name: /deleteorder/i})[0]);

        await waitFor(() => {
            expect(screen.queryByText('Cement')).not.toBeInTheDocument();
        });
    });

});
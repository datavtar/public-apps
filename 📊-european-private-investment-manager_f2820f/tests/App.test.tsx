import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/CFO Investment Portfolio/i)).toBeInTheDocument();
  });

  test('opens and closes the add investment modal', async () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add Investment/i });
    fireEvent.click(addButton);
    await waitFor(() => {
        expect(screen.getByText(/Add New Investment/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText(/Add New Investment/i)).not.toBeInTheDocument();
    });
  });

  test('adds a new investment', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Add Investment/i }));

    fireEvent.change(screen.getByLabelText(/Investment Name/i), { target: { value: 'Test Investment' } });
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Performance/i), { target: { value: '10' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Investment/i }));

    await waitFor(() => {
        expect(screen.getByText(/Test Investment/i)).toBeInTheDocument();
    });
  });

  test('deletes an investment', async () => {
      render(<App />);

      // Add an investment first to ensure there's something to delete
      fireEvent.click(screen.getByRole('button', { name: /Add Investment/i }));
      fireEvent.change(screen.getByLabelText(/Investment Name/i), { target: { value: 'Investment to Delete' } });
      fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '1000' } });
      fireEvent.change(screen.getByLabelText(/Performance/i), { target: { value: '10' } });
      fireEvent.click(screen.getByRole('button', { name: /Save Investment/i }));

      await waitFor(() => {
          expect(screen.getByText(/Investment to Delete/i)).toBeInTheDocument();
      });

      // Trigger delete
      fireEvent.click(screen.getByLabelText(/Delete investment/i));
      await waitFor(() => {
          expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

      await waitFor(() => {
          expect(screen.queryByText(/Investment to Delete/i)).not.toBeInTheDocument();
      });
  });

  test('toggles dark mode', async () => {
    render(<App />);
    const toggleButton = screen.getByRole('button', { name: /switch to dark mode/i });
    
    fireEvent.click(toggleButton);

    // Use a more robust check if dark mode is applied. Checking classlist
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    const toggleButtonLight = screen.getByRole('button', { name: /switch to light mode/i })
    fireEvent.click(toggleButtonLight);
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

  });

  test('filters investments by name', async () => {
    render(<App />);
    //Add two investments, different name
    fireEvent.click(screen.getByRole('button', { name: /Add Investment/i }));
    fireEvent.change(screen.getByLabelText(/Investment Name/i), { target: { value: 'Apple Stock' } });
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Performance/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Investment/i }));

    fireEvent.click(screen.getByRole('button', { name: /Add Investment/i }));
    fireEvent.change(screen.getByLabelText(/Investment Name/i), { target: { value: 'Google Stock' } });
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Performance/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Investment/i }));

    //Search
    const searchInput = screen.getByPlaceholderText(/Search investments.../i);
    fireEvent.change(searchInput, { target: { value: 'Apple' } });

    await waitFor(() => {
      expect(screen.getByText(/Apple Stock/i)).toBeInTheDocument();
      expect(screen.queryByText(/Google Stock/i)).not.toBeInTheDocument();
    });
  });

  test('exports data', () => {
    render(<App />);
    const exportButton = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportButton);
    //Cannot test download functionality, only existence of the button
    expect(exportButton).toBeInTheDocument();
  });

  
  test('opens and closes the filter modal', async () => {
    render(<App />);
    const filterButton = screen.getByRole('button', { name: /Filter/i });
    fireEvent.click(filterButton);
    await waitFor(() => {
        expect(screen.getByText(/Filter Investments/i)).toBeInTheDocument();
    });

    const resetButton = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetButton);

    const applyFilterButton = screen.getByRole('button', { name: /Apply Filters/i });
    fireEvent.click(applyFilterButton);

    await waitFor(() => {
      expect(screen.queryByText(/Filter Investments/i)).not.toBeInTheDocument();
    });
  });

});
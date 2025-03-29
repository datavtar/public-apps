import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';



describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/CFO Investment Dashboard/i)).toBeInTheDocument();
  });

  test('add new investment navigates to form', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Add Investment/i }));
    expect(screen.getByText(/Add New Investment/i)).toBeInTheDocument();
  });

  test('edit investment navigates to form', async () => {
    render(<App />);
    const editButtons = await screen.findAllByRole('button', { name: /^Edit/i });
    fireEvent.click(editButtons[0]);
    expect(screen.getByText(/Edit Investment/i)).toBeInTheDocument();
  });

  test('dark mode toggle works', async () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    const lightModeButton = screen.getByRole('button', { name: /Switch to light mode/i });
    fireEvent.click(lightModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('delete investment removes it from the list', async () => {
    render(<App />);
    const deleteButtons = await screen.findAllByRole('button', { name: /^Delete/i });
    const initialInvestmentCount = deleteButtons.length;
    
    // Mock window.confirm
    const mockConfirm = jest.spyOn(window, 'confirm');
    mockConfirm.mockImplementation(() => true);

    fireEvent.click(deleteButtons[0]);

    // Restore window.confirm
    mockConfirm.mockRestore();
    
    const updatedDeleteButtons = await screen.findAllByRole('button', { name: /^Delete/i });
    expect(updatedDeleteButtons.length).toBe(initialInvestmentCount - 1);
  });

  test('export and import', () => {
    const { getByRole, getByText } = render(<App />);

    // Mock the file import
    const fileContent = JSON.stringify([{ id: 'test', name: 'Test Investment', type: 'Stock', amount: 1000, currency: 'EUR', country: 'Germany', purchaseDate: '2023-01-01', currentValue: 1200, notes: 'Test notes', lastUpdated: '2023-06-01' }]);
    const file = new File([fileContent], 'investments.json', { type: 'application/json' });

    const input = getByRole('button', {name: /import/i}).parentElement?.querySelector('input')
    
    if(input){
      fireEvent.change(input, { target: { files: [file] } });
      expect(getByText('Test Investment')).toBeInTheDocument();
    }
  });
});
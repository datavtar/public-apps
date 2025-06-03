import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Warehouse Manager/i)).toBeInTheDocument();
  });

  test('displays inventory management when inventory link is clicked', async () => {
    render(<App />);
    const inventoryLink = screen.getByRole('button', { name: /Inventory/i });
    fireEvent.click(inventoryLink);
    expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();
  });

  test('displays movements when movements link is clicked', async () => {
    render(<App />);
    const movementsLink = screen.getByRole('button', { name: /Movements/i });
    fireEvent.click(movementsLink);
    expect(screen.getByText(/Movement History/i)).toBeInTheDocument();
  });

 test('displays analytics when analytics link is clicked', async () => {
    render(<App />);
    const analyticsLink = screen.getByRole('button', { name: /Analytics/i });
    fireEvent.click(analyticsLink);
    expect(screen.getByText(/Analytics & Reports/i)).toBeInTheDocument();
  });

  test('opens add item modal when add item button is clicked in inventory', async () => {
    render(<App />);
    const inventoryLink = screen.getByRole('button', { name: /Inventory/i });
    fireEvent.click(inventoryLink);
    const addItemButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addItemButton);
    expect(screen.getByText(/Add New Item/i)).toBeInTheDocument();
  });

  test('opens record movement modal when record movement button is clicked in movements', async () => {
    render(<App />);
    const movementsLink = screen.getByRole('button', { name: /Movements/i });
    fireEvent.click(movementsLink);
    const recordMovementButton = screen.getByRole('button', { name: /Record Movement/i });
    fireEvent.click(recordMovementButton);
    expect(screen.getByText(/Record Movement/i)).toBeInTheDocument();
  });

});
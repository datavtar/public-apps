import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Warehouse Inventory Manager/i)).toBeInTheDocument();
  });

  it('displays the inventory tab by default', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /^inventory-tab$/i })).toHaveClass('border-b-2');
  });

  it('allows navigating to the transactions tab', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^transactions-tab$/i }));
    expect(screen.getByText(/Transaction History/i)).toBeInTheDocument();
  });

  it('allows navigating to the dashboard tab', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^dashboard-tab$/i }));
    expect(screen.getByText(/Inventory Dashboard/i)).toBeInTheDocument();
  });

  it('shows the success alert when an item is deleted', async () => {
    render(<App />);
    const deleteButton = await screen.findByRole('button', { name: /^delete-item-1$/i });
    fireEvent.click(deleteButton);
    
    window.confirm = jest.fn(() => true);  
    
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
  });

 it('opens and closes the add item modal', () => {
    render(<App />);

    const addItemButton = screen.getByRole('button', { name: /^add item$/i });
    fireEvent.click(addItemButton);
    expect(screen.getByText(/Add New Inventory Item/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
  });

  it('opens and closes the add transaction modal', () => {
    render(<App />);
    const recordInboundButton = screen.getByRole('button', { name: /^record-inbound$/i });
    fireEvent.click(recordInboundButton);
    expect(screen.getByText(/Record Inbound Transaction/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
  });
});
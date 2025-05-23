import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders Invoice Management heading', () => {
    render(<App />);
    expect(screen.getByText(/Invoice Management/i)).toBeInTheDocument();
  });

  test('renders New Invoice button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /New Invoice/i })).toBeInTheDocument();
  });

  test('renders search input', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Search invoices.../i)).toBeInTheDocument();
  });

  test('add new invoice', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /New Invoice/i }));

    fireEvent.change(screen.getByLabelText(/Invoice Number \*/i), { target: { value: 'INV-2025-004' } });
    fireEvent.change(screen.getByLabelText(/Client Name \*/i), { target: { value: 'Test Client' } });
    fireEvent.change(screen.getByLabelText(/Issue Date \*/i), { target: { value: '2025-02-01' } });
    fireEvent.change(screen.getByLabelText(/Due Date \*/i), { target: { value: '2025-02-28' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Invoice/i }));
    
    expect(screen.getByText(/Invoice Management/i)).toBeInTheDocument();
  });

  test('filters invoices by search term', async () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Search invoices.../i);
    fireEvent.change(searchInput, { target: { value: 'Acme' } });

    expect(screen.getByText(/Acme Corporation/i)).toBeInTheDocument();
  });

  test('toggles theme', () => {
    render(<App />);
    const themeButton = screen.getByRole('button', {name: /Toggle theme/i});
    fireEvent.click(themeButton);
  });

  test('exports to CSV', async () => {
    const mockCreateObjectURL = jest.fn();
    const mockAppendChild = jest.fn();
    const mockClick = jest.fn();

    global.URL.createObjectURL = mockCreateObjectURL;
    global.document.body.appendChild = mockAppendChild;
    
    const element = {
        setAttribute: jest.fn(),
        style: {},
        click: mockClick
    };

    global.document.createElement = jest.fn(() => (element as any));

    render(<App />);

    const exportButton = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalledWith(element);
    expect(element.click).toHaveBeenCalled();
  });

  test('handle delete invoice', async () => {
    render(<App />);

    const deleteButton = screen.getAllByTitle('Delete')[0];
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(confirmDeleteButton);
  });
});
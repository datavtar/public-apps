import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


const mockInventoryData = [
    {
        id: '1',
        name: 'Item A',
        quantity: 10,
        lastUpdated: '2024-07-24',
        movementType: 'in',
    },
    {
        id: '2',
        name: 'Item B',
        quantity: 5,
        lastUpdated: '2024-07-23',
        movementType: 'out',
    },
];




describe('App Component', () => {
    beforeEach(() => {
        jest.spyOn(window, 'fetch').mockImplementation(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockInventoryData),
            } as any)
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders without crashing', () => {
        render(<App />);
    });

    it('displays loading state initially', () => {
        render(<App />);
        expect(screen.getByText('Warehouse Inventory Tracker')).toBeInTheDocument();
    });

    it('displays inventory items after loading', async () => {
        render(<App />);
        await waitFor(() => expect(screen.getByText('Item A')).toBeInTheDocument());
        expect(screen.getByText('Item B')).toBeInTheDocument();
    });

    it('allows adding a new item', async () => {
        render(<App />);

        fireEvent.click(screen.getByRole('button', { name: /^Add Item$/i }));

        fireEvent.change(screen.getByRole('textbox', { name: 'Item Name' }), { target: { value: 'New Item' } });
        fireEvent.change(screen.getByRole('spinbutton', { name: 'Quantity' }), { target: { value: '20' } });
        fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

        await waitFor(() => expect(screen.getByText('New Item')).toBeInTheDocument());
    });

    it('allows editing an existing item', async () => {
        render(<App />);
        await waitFor(() => screen.getByText('Item A'));
        fireEvent.click(screen.getByRole('button', { name: /^editButton-1$/i }));
        fireEvent.change(screen.getByRole('textbox', { name: 'Item Name' }), { target: { value: 'Updated Item A' } });
        fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

        await waitFor(() => expect(screen.getByText('Updated Item A')).toBeInTheDocument());
    });

    it('allows deleting an existing item', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);
        render(<App />);
        await waitFor(() => screen.getByText('Item A'));
        fireEvent.click(screen.getByRole('button', { name: /^deleteButton-1$/i }));

        await waitFor(() => expect(screen.queryByText('Item A')).toBeNull());
      confirmSpy.mockRestore();
    });

    it('filters items based on search term', async () => {
        render(<App />);
        const searchInput = screen.getByRole('searchbox', { name: 'searchInput' });
        fireEvent.change(searchInput, { target: { value: 'Item A' } });

        await waitFor(() => expect(screen.getByText('Item A')).toBeInTheDocument());
        expect(screen.queryByText('Item B')).toBeNull();
    });

    it('displays error message when quantity is zero', async () => {
        render(<App />);
        fireEvent.click(screen.getByRole('button', { name: /^Add Item$/i }));

        fireEvent.change(screen.getByRole('textbox', { name: 'Item Name' }), { target: { value: 'Test Item' } });
        fireEvent.change(screen.getByRole('spinbutton', { name: 'Quantity' }), { target: { value: '0' } });

        fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

        await waitFor(() => {
            expect(screen.getByText('Quantity must be a postive number.')).toBeInTheDocument();
        });
    });

    it('displays error message when name or quantity is not filled', async () => {
        render(<App />);
        fireEvent.click(screen.getByRole('button', { name: /^Add Item$/i }));
        fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

        await waitFor(() => {
            expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
        });
    });
});
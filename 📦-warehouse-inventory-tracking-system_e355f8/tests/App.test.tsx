import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../src/App';


// Mock the initial dark mode state to prevent localStorage access during tests
const mockUseState = jest.fn();

jest.mock('react', () => {
 const ActualReact = jest.requireActual('react');
 return {
 ...ActualReact,
 useState: (initial: any) => {
 mockUseState(initial);
 return ActualReact.useState(initial);
 },
 };
});





describe('App Component', () => {
 beforeAll(() => {
 // Mock the window.matchMedia
 Object.defineProperty(window, 'matchMedia', {
 writable: true,
 value: jest.fn().mockImplementation(query => ({
 matches: false,
 media: query,
 addListener: jest.fn(),
 removeListener: jest.fn(),
 onchange: null,
 dispatchEvent: jest.fn(),
 })), 
 });

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
 writable: true,
 });
 });

 beforeEach(() => {
 jest.clearAllMocks();
 window.localStorage.clear();
 mockUseState.mockImplementation((initial: any) => React.useState(initial));
 });

 test('renders the component', async () => {
 render(<App />);
 
 // Wait for the loading state to disappear
 await waitFor(() => {
 expect(screen.queryByText('Loading Inventory System...')).not.toBeInTheDocument();
 });

 expect(screen.getByText('Warehouse Inventory Manager')).toBeInTheDocument();
 });

 test('shows loading state initially', () => {
 render(<App />);
 expect(screen.getByText('Loading Inventory System...')).toBeInTheDocument();
 });

 test('renders inventory items after loading', async () => {
 render(<App />);

 await waitFor(() => {
 expect(screen.queryByText('Loading Inventory System...')).not.toBeInTheDocument();
 });

 expect(screen.getByText('Laptop')).toBeInTheDocument();
 expect(screen.getByText('Smartphone')).toBeInTheDocument();
 });

 test('opens and closes the add item modal', async () => {
 render(<App />);

 await waitFor(() => {
 expect(screen.queryByText('Loading Inventory System...')).not.toBeInTheDocument();
 });

 fireEvent.click(screen.getByRole('button', { name: /Add Item/i }));

 await waitFor(() => {
 expect(screen.getByText('Add New Inventory Item')).toBeVisible();
 });

 fireEvent.click(screen.getByRole('button', { name: /Close modal/i }));

 await waitFor(() => {
 expect(screen.queryByText('Add New Inventory Item')).not.toBeInTheDocument();
 });
 });

 test('adds a new item to inventory', async () => {
 render(<App />);

 await waitFor(() => {
 expect(screen.queryByText('Loading Inventory System...')).not.toBeInTheDocument();
 });

 fireEvent.click(screen.getByRole('button', { name: /Add Item/i }));

 await waitFor(() => {
 expect(screen.getByText('Add New Inventory Item')).toBeVisible();
 });

 fireEvent.change(screen.getByLabelText(/Item Name/i), { target: { value: 'New Item' } });
 fireEvent.change(screen.getByLabelText(/SKU/i), { target: { value: 'NI-001' } });
 fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Tools' } });
 fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Aisle 3' } });
 fireEvent.change(screen.getByLabelText(/Initial Quantity/i), { target: { value: '5' } });

 fireEvent.click(screen.getByRole('button', { name: /Add Item/i }));

 await waitFor(() => {
 expect(screen.queryByText('New Item')).toBeInTheDocument();
 });

 });
});

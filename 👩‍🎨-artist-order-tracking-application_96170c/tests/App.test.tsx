import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'


// Mock localStorage
const localStorageMock = (() => {
 let store: { [key: string]: string } = {};

 return {
 getItem: (key: string): string | null => store[key] || null,
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

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
 writable: true,
 value: jest.fn().mockImplementation(query => ({
 matches: false,
 media: query,
 onchange: null,
 addListener: jest.fn(), // Deprecated
 removeListener: jest.fn(), // Deprecated
 addEventListener: jest.fn(),
 removeEventListener: jest.fn(),
 dispatchEvent: jest.fn(),
 })),
});


describe('App Component', () => {
 it('renders without crashing', () => {
 render(<App />);
 });

 it('displays Kunstenaar Bestellingenbeheer in the header', () => {
 render(<App />);
 const headerText = screen.getByText(/Kunstenaar Bestellingenbeheer/i);
 expect(headerText).toBeInTheDocument();
 });

 it('toggles dark mode', async () => {
 render(<App />);
 const toggleButton = screen.getByRole('button', { name: /Schakel naar donkere modus/i });

 fireEvent.click(toggleButton);

 expect(localStorage.getItem('darkMode')).toBe('true');

 fireEvent.click(toggleButton);

 expect(localStorage.getItem('darkMode')).toBe('false');
 });

 it('opens and closes the add order modal', async () => {
 render(<App />);
 const addButton = screen.getByRole('button', { name: /Nieuwe Bestelling/i });
 fireEvent.click(addButton);

 const modalTitle = screen.getByText(/Nieuwe Bestelling/i);
 expect(modalTitle).toBeInTheDocument();

 const cancelButton = screen.getByRole('button', { name: /Annuleren/i });
 fireEvent.click(cancelButton);

 await waitFor(() => {
 expect(screen.queryByText(/Nieuwe Bestelling/i)).toBeNull();
 });
 });

 it('adds a new order', async () => {
 render(<App />);
 const addButton = screen.getByRole('button', { name: /Nieuwe Bestelling/i });
 fireEvent.click(addButton);

 fireEvent.change(screen.getByLabelText(/Klantnaam/i), { target: { value: 'Test Customer' } });
 fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: 'test@example.com' } });
 fireEvent.change(screen.getByLabelText(/Datum/i), { target: { value: '2024-01-01' } });
 fireEvent.change(screen.getByLabelText(/Type Kunst/i), { target: { value: 'Painting' } });
 fireEvent.change(screen.getByLabelText(/Afmetingen/i), { target: { value: '10x10' } });
 fireEvent.change(screen.getByLabelText(/Bedrag/i), { target: { value: '100' } });
 fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'completed' } });
 fireEvent.change(screen.getByLabelText(/Beschrijving/i), { target: { value: 'Test Description' } });

 const submitButton = screen.getByRole('button', { name: /Toevoegen/i });
 fireEvent.click(submitButton);

 await waitFor(() => {
 expect(screen.getByText(/Bestelling succesvol bijgewerkt!/i)).toBeInTheDocument()
 });
 });

 it('opens and closes the view order modal', async () => {
 render(<App />);

 // Assuming there is at least one order to view
 const viewButton = screen.getAllByRole('button', { name: /Bekijk bestelling/i })[0];
 fireEvent.click(viewButton);

 const modalTitle = screen.getByText(/Bestellingsdetails/i);
 expect(modalTitle).toBeInTheDocument();

 const closeButton = screen.getByRole('button', { name: /Sluiten/i });
 fireEvent.click(closeButton);

 await waitFor(() => {
 expect(screen.queryByText(/Bestellingsdetails/i)).toBeNull();
 });
 });

 it('opens and closes the edit order modal', async () => {
 render(<App />);

 // Assuming there is at least one order to edit
 const editButton = screen.getAllByRole('button', { name: /Bewerk bestelling/i })[0];
 fireEvent.click(editButton);

 const modalTitle = screen.getByText(/Bestelling Bewerken/i);
 expect(modalTitle).toBeInTheDocument();

 const cancelButton = screen.getByRole('button', { name: /Annuleren/i });
 fireEvent.click(cancelButton);

 await waitFor(() => {
 expect(screen.queryByText(/Bestelling Bewerken/i)).toBeNull();
 });
 });

 it('opens and closes the delete order modal', async () => {
 render(<App />);

 // Assuming there is at least one order to delete
 const deleteButton = screen.getAllByRole('button', { name: /Verwijder bestelling/i })[0];
 fireEvent.click(deleteButton);

 const modalTitle = screen.getByText(/Bestelling Verwijderen/i);
 expect(modalTitle).toBeInTheDocument();

 const cancelButton = screen.getByRole('button', { name: /Annuleren/i });
 fireEvent.click(cancelButton);

 await waitFor(() => {
 expect(screen.queryByText(/Bestelling Verwijderen/i)).toBeNull();
 });
 });
});
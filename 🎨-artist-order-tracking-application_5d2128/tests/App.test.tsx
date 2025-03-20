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


// Mock window.confirm
const originalConfirm = window.confirm;

beforeEach(() => {
 window.confirm = jest.fn(() => true); // Always confirm
 localStorage.clear();
});

afterEach(() => {
 window.confirm = originalConfirm;
});


describe('App Component', () => {
 test('renders the component', () => {
 render(<App />);
 expect(screen.getByText(/Kunstenaar Bestellingen/i)).toBeInTheDocument();
 });

 test('opens and closes the modal', async () => {
 render(<App />);
 const addButton = screen.getByRole('button', { name: /Nieuwe Bestelling/i });
 fireEvent.click(addButton);

 await waitFor(() => {
 expect(screen.getByText(/Nieuwe bestelling/i)).toBeInTheDocument();
 });

 const closeButton = screen.getByRole('button', { name: /Sluiten/i });
 fireEvent.click(closeButton);

 await waitFor(() => {
 expect(screen.queryByText(/Nieuwe bestelling/i)).not.toBeInTheDocument();
 });
 });

 test('creates a new order', async () => {
 render(<App />);
 const addButton = screen.getByRole('button', { name: /Nieuwe Bestelling/i });
 fireEvent.click(addButton);

 await waitFor(() => {
 expect(screen.getByText(/Nieuwe bestelling/i)).toBeInTheDocument();
 });

 fireEvent.change(screen.getByLabelText(/Klantnaam \*/i), { target: { value: 'Test Client' } });
 fireEvent.change(screen.getByLabelText(/Prijs \(€\) \*/i), { target: { value: '100' } });
 fireEvent.change(screen.getByLabelText(/Leverdatum \*/i), { target: { value: '2024-12-31' } });
 fireEvent.change(screen.getByLabelText(/Beschrijving \*/i), { target: { value: 'Test Description' } });

 // Select material
 fireEvent.click(screen.getByRole('button', { name: /Toevoegen/i, disabled: true })); // Material is needed


 const submitButton = screen.getByRole('button', { name: /Toevoegen/i });
 // Submit without adding material
 fireEvent.click(submitButton);

 // check notification
 await waitFor(()=>{
 expect(screen.getByText(/Please select at least one material/i)).toBeInTheDocument()
 });

 fireEvent.change(screen.getByRole('textbox', { name: /Nieuw materiaal/i }), { target: { value: 'Canvas' } });
 fireEvent.click(screen.getByRole('button', { name: /Toevoegen/i }));

 fireEvent.click(submitButton);


 await waitFor(() => {
 expect(screen.queryByText(/Nieuwe bestelling/i)).not.toBeInTheDocument();
 });

 // Check that the new order is displayed
 expect(screen.getByText(/Test Client/i)).toBeInTheDocument();
 expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
 expect(screen.getByText(/€ 100,00/i)).toBeInTheDocument();

 });


 test('deletes an order', async () => {
 // First, create an order
 render(<App />);
 const addButton = screen.getByRole('button', { name: /Nieuwe Bestelling/i });
 fireEvent.click(addButton);

 await waitFor(() => {
 expect(screen.getByText(/Nieuwe bestelling/i)).toBeInTheDocument();
 });

 fireEvent.change(screen.getByLabelText(/Klantnaam \*/i), { target: { value: 'Test Client' } });
 fireEvent.change(screen.getByLabelText(/Prijs \(€\) \*/i), { target: { value: '100' } });
 fireEvent.change(screen.getByLabelText(/Leverdatum \*/i), { target: { value: '2024-12-31' } });
 fireEvent.change(screen.getByLabelText(/Beschrijving \*/i), { target: { value: 'Test Description' } });

 fireEvent.change(screen.getByRole('textbox', { name: /Nieuw materiaal/i }), { target: { value: 'Canvas' } });
 fireEvent.click(screen.getByRole('button', { name: /Toevoegen/i }));

 const submitButton = screen.getByRole('button', { name: /Toevoegen/i });
 fireEvent.click(submitButton);

 await waitFor(() => {
 expect(screen.queryByText(/Nieuwe bestelling/i)).not.toBeInTheDocument();
 });

 expect(screen.getByText(/Test Client/i)).toBeInTheDocument();

 const deleteButton = screen.getByRole('button', { name: /Verwijder bestelling van Test Client/i });
 fireEvent.click(deleteButton);

 await waitFor(() => {
 expect(screen.queryByText(/Test Client/i)).not.toBeInTheDocument();
 });
 });


 test('toggles dark mode', async () => {
 render(<App />);
 const darkModeButton = screen.getByRole('button', { name: /Schakel donkere modus in/i });
 fireEvent.click(darkModeButton);

 await waitFor(() => {
 expect(localStorage.getItem('darkMode')).toBe('true');
 });

 const lightModeButton = screen.getByRole('button', { name: /Schakel lichte modus in/i });
 fireEvent.click(lightModeButton);

 await waitFor(() => {
 expect(localStorage.getItem('darkMode')).toBe('false');
 });
 });

 test('filters orders by client name', async () => {
  render(<App />);

  // Add two orders with different client names
  fireEvent.click(screen.getByRole('button', { name: /Nieuwe Bestelling/i }));
  await waitFor(() => expect(screen.getByText(/Nieuwe bestelling/i)).toBeInTheDocument());
  fireEvent.change(screen.getByLabelText(/Klantnaam \*/i), { target: { value: 'Client A' } });
  fireEvent.change(screen.getByLabelText(/Prijs \(€\) \*/i), { target: { value: '100' } });
  fireEvent.change(screen.getByLabelText(/Leverdatum \*/i), { target: { value: '2024-12-31' } });
  fireEvent.change(screen.getByLabelText(/Beschrijving \*/i), { target: { value: 'Description A' } });
  fireEvent.change(screen.getByRole('textbox', { name: /Nieuw materiaal/i }), { target: { value: 'Canvas' } });
  fireEvent.click(screen.getByRole('button', { name: /Toevoegen/i }));
  fireEvent.click(screen.getByRole('button', { name: /Toevoegen/i }));
  await waitFor(() => expect(screen.queryByText(/Nieuwe bestelling/i)).not.toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: /Nieuwe Bestelling/i }));
  await waitFor(() => expect(screen.getByText(/Nieuwe bestelling/i)).toBeInTheDocument());
  fireEvent.change(screen.getByLabelText(/Klantnaam \*/i), { target: { value: 'Client B' } });
  fireEvent.change(screen.getByLabelText(/Prijs \(€\) \*/i), { target: { value: '200' } });
  fireEvent.change(screen.getByLabelText(/Leverdatum \*/i), { target: { value: '2025-01-31' } });
  fireEvent.change(screen.getByLabelText(/Beschrijving \*/i), { target: { value: 'Description B' } });
  fireEvent.change(screen.getByRole('textbox', { name: /Nieuw materiaal/i }), { target: { value: 'Paper' } });
  fireEvent.click(screen.getByRole('button', { name: /Toevoegen/i }));
  fireEvent.click(screen.getByRole('button', { name: /Toevoegen/i }));
  await waitFor(() => expect(screen.queryByText(/Nieuwe bestelling/i)).not.toBeInTheDocument());

  // Filter by 'Client A'
  fireEvent.change(screen.getByPlaceholderText(/Zoek op naam of beschrijving.../i), { target: { value: 'Client A' } });

  // Verify that only 'Client A' is displayed
  await waitFor(() => expect(screen.getByText(/Client A/i)).toBeInTheDocument());
  expect(screen.queryByText(/Client B/i)).toBeNull();

  // Clear the filter
  fireEvent.change(screen.getByPlaceholderText(/Zoek op naam of beschrijving.../i), { target: { value: '' } });

  // Verify that both clients are displayed again
  await waitFor(() => {
   expect(screen.getByText(/Client A/i)).toBeInTheDocument();
   expect(screen.getByText(/Client B/i)).toBeInTheDocument();
  });
 });
});
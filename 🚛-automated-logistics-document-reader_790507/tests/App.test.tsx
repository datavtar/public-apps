import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock the 'date-fns' format function to avoid timezone issues in tests
jest.mock('date-fns/format', () => ({
 format: jest.fn().mockImplementation((date, format) => {
 // Return a consistent string for testing purposes
 return 'Dec 25, 2024';
 })
}));

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

// Mock the file upload
const mockFiles = [
 new File(['hello'], 'invoice.pdf', { type: 'application/pdf' }),
];

describe('App Component', () => {
 beforeAll(() => {
 // Clear localStorage before all tests
 localStorageMock.clear();
 });

 afterEach(() => {
 // Restore the original implementation of `format` after each test
 jest.restoreAllMocks();
 });

 test('renders LogiDoc Reader title', () => {
 render(<App />);
 expect(screen.getByText(/LogiDoc Reader/i)).toBeInTheDocument();
 });

 test('displays total documents stat', () => {
 render(<App />);
 expect(screen.getByText(/Total Documents/i)).toBeInTheDocument();
 });

 test('displays processed documents stat', () => {
 render(<App />);
 expect(screen.getByText(/Processed/i)).toBeInTheDocument();
 });

 test('displays pending documents stat', () => {
 render(<App />);
 expect(screen.getByText(/Pending/i)).toBeInTheDocument();
 });

 test('displays error documents stat', () => {
 render(<App />);
 expect(screen.getByText(/Errors/i)).toBeInTheDocument();
 });

 test('uploads a document', async () => {
 render(<App />);
 const fileInput = screen.getByLabelText(/Upload new documents/i).querySelector('input') as HTMLInputElement;
 Object.defineProperty(fileInput, 'files', {
 value: mockFiles,
 });

 fireEvent.change(fileInput);

 // Wait for the uploading state to be removed
 await waitFor(() => {
 expect(screen.queryByText(/Uploading.../i)).toBeNull();
 }, { timeout: 2000 }); // Adjust timeout as necessary

 expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
 });

 test('filters documents by status', async () => {
 render(<App />);

 // Open upload dialog
 const fileInput = screen.getByLabelText(/Upload new documents/i).querySelector('input') as HTMLInputElement;
 Object.defineProperty(fileInput, 'files', {
 value: mockFiles,
 });
 fireEvent.change(fileInput);

 await waitFor(() => {
 expect(screen.queryByText(/Uploading.../i)).toBeNull();
 }, { timeout: 2000 });

 const statusFilter = screen.getByLabelText(/Filter by status/i);
 fireEvent.change(statusFilter, { target: { value: 'pending' } });

 expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
 });

 test('filters documents by type', async () => {
 render(<App />);

 // Open upload dialog
 const fileInput = screen.getByLabelText(/Upload new documents/i).querySelector('input') as HTMLInputElement;
 Object.defineProperty(fileInput, 'files', {
 value: mockFiles,
 });
 fireEvent.change(fileInput);

 await waitFor(() => {
 expect(screen.queryByText(/Uploading.../i)).toBeNull();
 }, { timeout: 2000 });

 const typeFilter = screen.getByLabelText(/Filter by document type/i);
 fireEvent.change(typeFilter, { target: { value: 'invoice' } });

 expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
 });

 test('searches documents', async () => {
 render(<App />);

 // Open upload dialog
 const fileInput = screen.getByLabelText(/Upload new documents/i).querySelector('input') as HTMLInputElement;
 Object.defineProperty(fileInput, 'files', {
 value: mockFiles,
 });
 fireEvent.change(fileInput);

 await waitFor(() => {
 expect(screen.queryByText(/Uploading.../i)).toBeNull();
 }, { timeout: 2000 });

 const searchInput = screen.getByPlaceholderText(/Search documents.../i);
 fireEvent.change(searchInput, { target: { value: 'invoice' } });

 expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
 });

 test('toggles dark mode', () => {
 render(<App />);

 const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
 fireEvent.click(darkModeButton);

 expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
 });

 test('shows no documents message', () => {
 render(<App />);
 const noDocumentsMessage = screen.getByText(/No documents found/i);
 expect(noDocumentsMessage).toBeInTheDocument();
 });
});
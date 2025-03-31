import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
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
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders Kunst Bestellingen Beheer title', () => {
    render(<App />);
    expect(screen.getByText(/Kunst Bestellingen Beheer/i)).toBeInTheDocument();
  });

  test('adds a new order', async () => {
    render(<App />);

    // Arrange
    const addButton = screen.getByRole('button', { name: /Nieuwe Bestelling/i });

    // Act
    fireEvent.click(addButton);

    // Assert
    expect(screen.getByText(/Nieuwe Bestelling/i)).toBeInTheDocument();

    const clientNameInput = screen.getByLabelText(/Klantnaam \*/i);
    const descriptionInput = screen.getByLabelText(/Beschrijving \*/i);
    const submitButton = screen.getByRole('button', { name: /Toevoegen/i });

    fireEvent.change(clientNameInput, { target: { value: 'Test Client' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.click(submitButton);

    // Wait for notification to appear and disappear
    await new Promise((resolve) => setTimeout(resolve, 3500));

    expect(screen.queryByText(/Bestelling succesvol toegevoegd/i)).not.toBeInTheDocument();
  });

  test('displays no orders message when there are no orders', () => {
    render(<App />);
    expect(screen.getByText(/Geen bestellingen gevonden/i)).toBeInTheDocument();
  });

  test('filters orders by status', async () => {
    // Arrange
    localStorage.setItem('artOrders', JSON.stringify([
      {
        id: '1',
        clientName: 'Client 1',
        email: 'client1@example.com',
        phone: '123-456-7890',
        description: 'Description 1',
        price: 100,
        artworkType: 'painting',
        createdAt: new Date().toISOString(),
        status: 'new',
        paymentStatus: 'unpaid',
        dimensions: { unit: 'cm' },
        materials: []
      },
      {
        id: '2',
        clientName: 'Client 2',
        email: 'client2@example.com',
        phone: '098-765-4321',
        description: 'Description 2',
        price: 200,
        artworkType: 'sculpture',
        createdAt: new Date().toISOString(),
        status: 'completed',
        paymentStatus: 'paid',
        dimensions: { unit: 'cm' },
        materials: []
      }
    ]));

    render(<App />);
    const statusFilter = screen.getByLabelText(/Status/i);

    // Act
    fireEvent.change(statusFilter, { target: { value: 'completed' } });

    // Assert
    expect(screen.queryByText(/Client 1/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Client 2/i)).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Schakel naar donkermodus/i });

    fireEvent.click(darkModeButton);

    expect(localStorage.getItem('darkMode')).toBe('true');

    const darkModeButton2 = screen.getByRole('button', { name: /Schakel naar lichtmodus/i });
    fireEvent.click(darkModeButton2);
    expect(localStorage.getItem('darkMode')).toBe('false');

  });

  test('shows delete confirmation modal', async () => {
      // Arrange
      localStorage.setItem('artOrders', JSON.stringify([
        {
          id: '1',
          clientName: 'Client 1',
          email: 'client1@example.com',
          phone: '123-456-7890',
          description: 'Description 1',
          price: 100,
          artworkType: 'painting',
          createdAt: new Date().toISOString(),
          status: 'new',
          paymentStatus: 'unpaid',
          dimensions: { unit: 'cm' },
          materials: []
        }
      ]));
      render(<App />);

      // Act
      const deleteButton = await screen.findByRole('button', { name: /Verwijder bestelling/i });
      fireEvent.click(deleteButton);

      // Assert
      expect(screen.getByText(/Bestelling Verwijderen/i)).toBeInTheDocument();
    });
});
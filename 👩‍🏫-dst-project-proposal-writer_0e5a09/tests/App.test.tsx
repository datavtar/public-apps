import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
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
  }))
});

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders header and initial content', () => {
    render(<App />);
    expect(screen.getByText(/DST Proposal Manager/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Proposal/i })).toBeInTheDocument();
  });

  test('adds a new proposal', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /New Proposal/i }));

    await waitFor(() => screen.getByRole('dialog'));

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Test Proposal' } });
    fireEvent.change(screen.getByLabelText(/Objective/i), { target: { value: 'Test Objective' } });
    fireEvent.change(screen.getByLabelText(/Methodology/i), { target: { value: 'Test Methodology' } });
    fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Timeline/i), { target: { value: '6 months' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Proposal/i }));

    await waitFor(() => {
      expect(screen.getByText(/Test Proposal/i)).toBeInTheDocument();
    });
  });

  test('opens and closes the new proposal modal', async () => {
    render(<App />);
    const newProposalButton = screen.getByRole('button', { name: /New Proposal/i });
    fireEvent.click(newProposalButton);
    await waitFor(() => screen.getByRole('dialog'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

 test('deletes a proposal', async () => {
    render(<App />);

    // Create a new proposal first
    fireEvent.click(screen.getByRole('button', { name: /New Proposal/i }));
    await waitFor(() => screen.getByRole('dialog'));
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Proposal to Delete' } });
    fireEvent.change(screen.getByLabelText(/Objective/i), { target: { value: 'Objective to Delete' } });
    fireEvent.change(screen.getByLabelText(/Methodology/i), { target: { value: 'Methodology to Delete' } });
    fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Timeline/i), { target: { value: '6 months' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Proposal/i }));

    await waitFor(() => screen.getByText(/Proposal to Delete/i));

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => screen.getByRole('dialog'));
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Proposal to Delete/i)).not.toBeInTheDocument();
    });
  });

  test('downloads the template', () => {
    const mockCreateObjectURL = jest.fn();
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();
    const mockRevokeObjectURL = jest.fn();
    
    global.URL.createObjectURL = mockCreateObjectURL;
    global.document.body.appendChild = mockAppendChild;
    global.document.body.removeChild = mockRemoveChild;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Download Template/i }));

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalled();

    // Clean up mocks
    global.URL.createObjectURL = URL.createObjectURL;
    global.document.body.appendChild = document.body.appendChild;
    global.document.body.removeChild = document.body.removeChild;
    global.URL.revokeObjectURL = URL.revokeObjectURL;
  });

  test('filters proposals by status', async () => {
    render(<App />);

    const selectStatus = screen.getByRole('combobox', { name: /All Statuses/i });
    fireEvent.change(selectStatus, { target: { value: 'approved' } });

    await waitFor(() => {
      // Check if at least one element with status "approved" is displayed
      const approvedElements = screen.getAllByText(/Approved/i);
      expect(approvedElements.length).toBeGreaterThan(0);
    });
  });
});
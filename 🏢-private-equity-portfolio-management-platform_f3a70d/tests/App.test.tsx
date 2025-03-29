import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import userEvent from '@testing-library/user-event';

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


// Mock the crypto.randomUUID function
global.crypto = {
  // @ts-ignore
  randomUUID: () => 'test-uuid',
};


// Helper function to render a component within a Router context
const renderWithRouter = (ui: React.ReactElement, initialRoute = '/') => {
    const history = createMemoryHistory({ initialEntries: [initialRoute] });
    return render(
        <MemoryRouter history={history} initialEntries={[initialRoute]}>
            {ui}
        </MemoryRouter>
    );
};



test('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByText(/EquityManager/i);
    expect(linkElement).toBeInTheDocument();
});


test('Dashboard renders without crashing', async () => {
  const { container } = renderWithRouter(<App />);
  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });
});


test('Companies List renders without crashing', async () => {
  const { container } = renderWithRouter(<App />, '/companies');
  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });
});


test('Add Company renders without crashing', async () => {
  const { container } = renderWithRouter(<App />, '/companies/add');
  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });
});


test('Add Company form shows validation errors when empty', async () => {
    renderWithRouter(<App />, '/companies/add');
    const saveButton = screen.getByRole('button', { name: /Save Company/i });
    userEvent.click(saveButton);

    await waitFor(() => {
        expect(screen.getByText('Company name is required')).toBeInTheDocument();
        expect(screen.getByText('Industry is required')).toBeInTheDocument();
        expect(screen.getByText('Contact person is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    });
});




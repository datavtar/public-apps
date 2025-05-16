import '@testing-library/jest-dom'
import * as React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import App from '../src/App'


test('renders the component', async () => {
  render(<App />);
  
  // Wait for the component to load data (adjust timeout if needed)
  await waitFor(() => {
    expect(screen.getByText(/ABC Talkies/i)).toBeInTheDocument();
  }, { timeout: 2000 });
});

test('renders hero section with featured movie details', async () => {
    render(<App />);

    await waitFor(() => {
        expect(screen.getByRole('button', { name: /watch now/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /watch trailer/i })).toBeInTheDocument();
    }, { timeout: 2000 })
});

test('renders explore movies section after navigation', async () => {
    render(<App />);

    await waitFor(() => {
        expect(screen.getByText(/Explore Movies/i)).toBeInTheDocument()
    }, { timeout: 2000 })
});

test('renders marketplace movies section after navigation', async () => {
    render(<App />);

    await waitFor(() => {
        expect(screen.getByText(/Cinema Marketplace/i)).toBeInTheDocument()
    }, { timeout: 2000 })
});

test('renders watchlist movies section after navigation', async () => {
    render(<App />);

    await waitFor(() => {
        expect(screen.getByText(/My Watchlist/i)).toBeInTheDocument()
    }, { timeout: 2000 })
});

test('renders profile movies section after navigation', async () => {
    render(<App />);

    await waitFor(() => {
        expect(screen.getByText(/User Profile/i)).toBeInTheDocument()
    }, { timeout: 2000 })
});